import { MessageEmbed } from 'discord.js';
import { Bot } from '../bot';
import * as Steam from '../apis/steam';
import { steamModel } from '../database/models/steam';
import { Alert } from '../types/alerts';
import { logger } from '../utils/logger';

export const data = {
    name: 'wishlists',
    schedule: '0 */15 7-23 * * *'
}

export const execute = async (client: Bot) => {
    const integrations = await steamModel.find({ notifications: true });
    for(const integration of integrations) {
        const wishlist = await Steam.getWishlist(integration.profile.id);
        if(!wishlist) continue;

        const wishlistAlerts = new Map<string, Alert[]>();
        const wishlistItems = wishlist.map(item => {
            const storedItem = integration.wishlist.find(nestedItem => nestedItem.name === item.name);
            let notified = storedItem && item.sale ? storedItem.notified : false;

            const alert = {
                name: item.name,
                url: item.url,
                discount: item.discount,
                regular: item.regular,
                discounted: item.discounted,
                addedTo: [] as string[],
                removedFrom: [] as string[]
            }

            for(const [subscription, isInSubscription] of Object.entries(item.subscriptions)) {
                if(!storedItem) break;
                const { 1: isInStoredSubscription } = Object.entries(storedItem.subscriptions).find(([key, value]) => key === subscription)!;

                if(!isInStoredSubscription && isInSubscription) alert.addedTo.push(`> • **${subscription.replace(/_/g, ' ').toUpperCase()}**`);
                if(isInStoredSubscription && !isInSubscription) alert.removedFrom.push(`> • **${subscription.replace(/_/g, ' ').toUpperCase()}**`);
            }

            if(alert.addedTo.length > 0) {
                const addedToSubscriptionAlerts = wishlistAlerts.get('subscriptions.added');
                addedToSubscriptionAlerts?.push(alert) ?? wishlistAlerts.set('subscriptions.added', [alert]);
            }

            if(alert.removedFrom.length > 0) {
                const removedFromSubscriptionAlerts = wishlistAlerts.get('subscriptions.removed');
                removedFromSubscriptionAlerts?.push(alert) ?? wishlistAlerts.set('subscriptions.removed', [alert]);
            }

            if(storedItem && !storedItem.released && item.released) {
                const releasedAlerts = wishlistAlerts.get('released');
                releasedAlerts?.push(alert) ?? wishlistAlerts.set('released', [alert]);

                if(item.sale) notified = true;
            }

            if(item.sale && item.released && !notified) {
                const saleAlerts = wishlistAlerts.get('sale');
                saleAlerts?.push(alert) ?? wishlistAlerts.set('sale', [alert]);
                
                notified = true;
            }

            return {
                ...item,
                notified
            }
        });

        await steamModel.updateOne({ userId: integration.userId }, { $set: { 'wishlist': wishlistItems } });

        for(const [category, alerts] of wishlistAlerts.entries()) {
            const user = await client.users.fetch(integration.userId);

            const title = getTitle(category, alerts.length);
            const description = getDescription(category, alerts.slice(0, 10));

            await user.send({ embeds: [
                new MessageEmbed()
                    .setTitle(title)
                    .setDescription(description.join('\n'))
                    .setColor('RANDOM')
            ]});

            logger.info(`Wishlists job notified \`${user.tag}\` about \`${alerts.length}\` items in \`${category}\` category.`);
        }
    }
}

const getTitle = (category: string, totalItems: number) => {
    const options: Record<string, string> = {
        'subscriptions.added': totalItems === 1 ? '**1** item from your wishlist is now included with a subscription service!' : `**${totalItems}** items from your wishlist are now included with a subscription service!`,
        'subscriptions.removed': totalItems === 1 ? '**1** item from your wishlist has left a subscription service!' : `**${totalItems}** items from your wishlist have left a subscription service!`,
        'released': totalItems === 1 ? '**1** item from your wishlist is now available!' : `**${totalItems}** items from your wishlist are now available!`,
        'sale': totalItems === 1 ? '**1** item from your wishlist is on sale!' : `**${totalItems}** items from your wishlist are on sale!`
    }
    
    return options[category];
}

const getDescription = (category: string, items: Alert[]) => {
    const options: Record<string, string[]> = {
        'subscriptions.added': items.map(item => `> **[${item.name}](${item.url})** added to:\n${item.addedTo.join('\n')}`),
        'subscriptions.removed': items.map(item => `> **[${item.name}](${item.url})** removed from:\n${item.removedFrom.join('\n')}`),
        'released': items.map(item => `> **[${item.name}](${item.url})** available for **${item.discounted}**`),
        'sale': items.map(item => `> **[${item.name}](${item.url})** is ***${item.discount}%*** off! ~~${item.regular}~~ | **${item.discounted}**`)
    }

    return options[category];
}