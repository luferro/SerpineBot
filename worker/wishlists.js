const fetch = require('node-fetch');
const subscriptionsSchema = require('../models/subscriptionsSchema');
const wishlistsSchema = require('../models/wishlistsSchema');
const { slug } = require('../utils/slug');

module.exports = {
	name: 'wishlists',
    formatNumber(cents) {
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(cents / 100);
    },
    getWishlistUser(url) {
        const no_sorting = url.split('#')[0];
        const str = no_sorting.slice(0, no_sorting.length);
        const no_slash = str.charAt(str.length - 1) === '/' ? str.slice(0, str.length - 1) : str;
        return no_slash.split('/').pop();
    },
    async getWishlistItems(url) {
        const type = url.includes('id') ? 'id' : 'profiles';
        const user = this.getWishlistUser(url);
        try {
            const subscriptions = await subscriptionsSchema.find();

            const items = [];
            let hasMore = true;
            let page = 0;
            while(hasMore) {
                const res = await fetch(`https://store.steampowered.com/wishlist/${type}/${user}/wishlistdata?p=${page}`);
                const data = await res.json();

                hasMore = Object.keys(data).some(item => !isNaN(item));
                if(page === 0 && !hasMore) return { error: 'Wishlist is set to private or is empty.' };

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
            const wishlists = await wishlistsSchema.find();
            for (const wishlist of wishlists) {
                await new Promise(resolve => setTimeout(resolve, 5000));

                const items = await this.getWishlistItems(wishlist.list);
                if(items.error) continue;

                const sale = [], released = [], subscriptions = { added: [], removed: [] };
                for(const item of items) {
                    const storedItem = wishlist.items.find(element => element.name === item.name);
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

                await wishlistsSchema.updateOne({ user: wishlist.user, tag: wishlist.tag }, { $set: { items } }, { upsert: true });
                
                if(sale.length > 0) this.sendNotification(client, wishlist.user, sale, 'sale');
                if(released.length > 0) this.sendNotification(client, wishlist.user, released, 'released');
                if(subscriptions.added.length > 0) this.sendNotification(client, wishlist.user, subscriptions.added, 'added');
                if(subscriptions.removed.length > 0) this.sendNotification(client, wishlist.user, subscriptions.removed, 'removed');
            }
        } catch (error) {
            console.log(error);
        }
    },
    async sendNotification(client, user_id, list, type) {
        try {
            const user = await client.users.fetch(user_id);
            const totalItems = list.length;
            const displayItems = list.slice(0, 10);

            const getMessage = (type) => {
                const options = {
                    'added': { 
                        title: totalItems === 1 ? '**1** item from your wishlist is now included with a subscription service!' : `**${totalItems}** items from your wishlist are now included with a subscription service!`,
                        description: `
                            ${displayItems.map(item =>
                                `> **[${item.name}](${item.url})** added to:
                                ${Array.isArray(item.subscriptions) && item.subscriptions.join('\n')}\n`
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
