const fetch = require('node-fetch');
const subscriptionsSchema = require('../models/subscriptionsSchema');
const steamSchema = require('../models/steamSchema');
const { slug } = require('../utils/slug');

module.exports = {
	name: 'wishlists',
    formatNumber(cents) {
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(cents / 100);
    },
    async getItems(url) {
        const wishlist = url.match(/https?:\/\/store.steampowered\.com\/wishlist\/(profiles|id)\/([a-zA-Z0-9]+)/);
        if(!wishlist) return { error: 'Invalid Steam wishlist URL.' };

        const type = wishlist[1];
        const user = wishlist[2];
        try {
            const subscriptions = await subscriptionsSchema.find();

            const items = [];
            let hasMore = true;
            let page = 0;
            while(hasMore) {
                const res = await fetch(`https://store.steampowered.com/wishlist/${type}/${user}/wishlistdata?p=${page}`);
                const data = await res.json();

                hasMore = Object.keys(data).some(item => !isNaN(item));
                if(page === 0 && !hasMore) return { error: 'Steam wishlist is set to private or is empty.' };

                Object.keys(data).map(item => {
                    const discount = data[item].subs.length > 0 ? data[item].subs[0].discount_pct : null;
                    const regular = data[item].subs.length > 0 ? this.formatNumber(Math.round(data[item].subs[0].price / ((100 - data[item].subs[0].discount_pct) / 100))) : null;
                    const discounted = data[item].subs.length > 0 ? this.formatNumber(data[item].subs[0].price) : null;

                    const subscription = subscriptions.map(element => {
                        const hasSubscription = element.items.some(nestedElement => new RegExp(`^${slug(data[item].name)}`).test(nestedElement.slug));
                        if(hasSubscription) return element.subscription;
                    }).filter(Boolean);

                    items.push({
                        id: item,
                        url: `https://store.steampowered.com/app/${item}`,
                        priority: data[item].priority,
                        name: data[item].name,
                        discount,
                        regular,
                        discounted,
                        free: data[item].is_free_game,
                        released: !data[item].prerelease ? true : false,
                        sale: discount && discounted ? true : false,
                        subscriptions: {
                            'Xbox Game Pass for Console': subscription.some(item => item === 'Xbox Game Pass for Console'),
                            'Xbox Game Pass for PC': subscription.some(item => item === 'Xbox Game Pass for PC'),
                            'Ubisoft+ for PC': subscription.some(item => item === 'Ubisoft+ for PC'),
                            'EA Play': subscription.some(item => item === 'EA Play'),
                            'EA Play Pro': subscription.some(item => item === 'EA Play Pro') 
                        }
                    });
                });
                page++;
            }
            return items.sort((a, b) => (a.priority !== 0 ? a.priority : Infinity) - (b.priority !== 0 ? b.priority : Infinity));      
        } catch (error) {
            console.log(error);
        }
    },
    async checkWishlist(client) {
        try {
            const profiles = await steamSchema.find();
            for (const profile of profiles) {
                await new Promise(resolve => setTimeout(resolve, 5000));

                const items = await this.getItems(profile.wishlist.url);
                if(items.error) continue;

                const sale = [], released = [], subscriptions = { added: [], removed: [] };
                for(const item of items) {
                    const storedItem = profile.wishlist.items.find(element => element.name === item.name);
                    item.notified = item.sale ? storedItem?.notified || false : false;

                    for(const key in item.subscriptions) {
                        if(!storedItem || !storedItem.hasOwnProperty('subscriptions')) break;

                        if(!storedItem.subscriptions[key] && item.subscriptions[key]) {
                            const entry = subscriptions.added.find(element => element.name === item.name);
                            if(entry) entry.subscriptions.push(`> • **${key}**`);
                            else subscriptions.added.push({ ...item, subscriptions: [`> • **${key}**`] });
                        }

                        if(storedItem.subscriptions[key] && !item.subscriptions[key]) {
                            const entry = subscriptions.removed.find(element => element.name === item.name);
                            if(entry) entry.subscriptions.push(`> • **${key}**`);
                            else subscriptions.removed.push({ ...item, subscriptions: [`> • **${key}**`] });
                        }   
                    }

                    if(storedItem && !storedItem.released && item.released) {
                        released.push(item);
                        item.sale && (item.notified = true);
                        continue;
                    }

                    if(item.sale && item.released && !item.notified) {
                        sale.push(item);
                        item.notified = true;
                        continue;
                    }
                }

                await steamSchema.updateOne({ user: profile.user, tag: profile.tag }, { $set: { 'wishlist.items': items } }, { upsert: true });
                
                if(sale.length > 0) this.sendNotification(client, profile.user, sale, 'sale');
                if(released.length > 0) this.sendNotification(client, profile.user, released, 'released');
                if(subscriptions.added.length > 0) this.sendNotification(client, profile.user, subscriptions.added, 'added');
                if(subscriptions.removed.length > 0) this.sendNotification(client, profile.user, subscriptions.removed, 'removed');
            }
        } catch (error) {
            console.log(error);
        }
    },
    async sendNotification(client, userID, list, type) {
        try {
            const user = await client.users.fetch(userID);
            const totalItems = list.length;
            const displayItems = list.slice(0, 10);

            const getMessage = (type) => {
                const options = {
                    'added': { 
                        title: totalItems === 1 ? '**1** item from your wishlist is now included with a subscription service!' : `**${totalItems}** items from your wishlist are now included with a subscription service!`,
                        description: `
                            ${displayItems.map(item =>
                                `> **[${item.name}](${item.url})** added to:
                                ${Array.isArray(item.subscriptions) && item.subscriptions.join('\n')}`
                            ).join('\n')}
                            ${totalItems - displayItems.length > 0 ? `And ${totalItems - displayItems.length} more!` : ''}
                        `
                    },
                    'removed': { 
                        title: totalItems === 1 ? '**1** item from your wishlist has left a subscription service!' : `**${totalItems}** items from your wishlist have left a subscription service!`,
                        description: `
                            ${displayItems.map(item =>
                                `> **[${item.name}](${item.url})** removed from:
                                ${Array.isArray(item.subscriptions) && item.subscriptions.join('\n')}`
                            ).join('\n')}
                            ${totalItems - displayItems.length > 0 ? `And ${totalItems - displayItems.length} more!` : ''}
                        `
                    },
                    'released': { 
                        title: totalItems === 1 ? '**1** item from your wishlist is now available!' : `**${totalItems}** items from your wishlist are now available!`,
                        description: `
                            ${displayItems.map(item =>
                                `> **[${item.name}](${item.url})** available for **${item.discounted}**`
                            ).join('\n')}
                            ${totalItems - displayItems.length > 0 ? `And ${totalItems - displayItems.length} more!` : ''}
                        `
                    },
                    'sale': { 
                        title: totalItems === 1 ? '**1** item from your wishlist is on sale!' : `**${totalItems}** items from your wishlist are on sale!`,
                        description: `
                            ${displayItems.map(item =>
                                `> **[${item.name}](${item.url})** is ***${item.discount}%*** off! ~~${item.regular}~~ | **${item.discounted}**`
                            ).join('\n')}
                            ${totalItems - displayItems.length > 0 ? `And ${totalItems - displayItems.length} more!` : ''}
                        `
                    }
                }
                return options[type];
            }
            const { title, description } = getMessage(type);

            user.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title,
                description
            }});
        } catch (error) {
            console.log(error);
        }
    }
};
