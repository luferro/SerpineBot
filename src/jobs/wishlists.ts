import { MessageEmbed } from 'discord.js';
import { Bot } from '../bot';
import * as Steam from '../apis/steam';
import { steamModel } from '../database/models/steam';
import { Alert } from '../types/alerts';
import { logger } from '../utils/logger';

export const data = {
	name: 'wishlists',
	schedule: '0 */15 7-23 * * *',
};

export const execute = async (client: Bot) => {
	const integrations = await steamModel.find({ notifications: true });
	for (const integration of integrations) {
		const wishlist = await Steam.getWishlist(integration.profile.id);
		if (!wishlist) continue;

		const wishlistAlerts = new Map<string, Alert[]>([
			['sale', []],
			['released', []],
			['subscriptions.added', []],
			['subscriptions.removed', []],
		]);
		const wishlistItems = wishlist.map((game) => {
			const saleAlerts = wishlistAlerts.get('sale')!;
			const releasedAlerts = wishlistAlerts.get('released')!;
			const addedToSubscriptionAlerts = wishlistAlerts.get('subscriptions.added')!;
			const removedFromSubscriptionAlerts = wishlistAlerts.get('subscriptions.removed')!;

			const { name, subscriptions, sale: isSale, released: isReleased } = game;

			const alert = {
				...game,
				addedTo: [] as string[],
				removedFrom: [] as string[],
			};

			const storedItem = integration.wishlist.find(
				({ name: nestedStoredItemName }) => nestedStoredItemName === name,
			);
			let notified = storedItem && isSale ? storedItem.notified : false;

			for (const [subscription, isInSubscription] of Object.entries(subscriptions)) {
				const { 1: isInStoredSubscription } = Object.entries(storedItem?.subscriptions ?? {}).find(
					([key]) => key === subscription,
				)!;

				const formmattedSubscription = `> • **${subscription.replace(/_/g, ' ').toUpperCase()}**`;

				if (!isInStoredSubscription && isInSubscription) alert.addedTo.push(formmattedSubscription);
				if (isInStoredSubscription && !isInSubscription) alert.removedFrom.push(formmattedSubscription);
			}

			const isSaleAlert = isSale && isReleased && !notified;
			const isReleasedAlert = storedItem && !storedItem.released && isReleased;
			const isAddedToSubscriptionAlert = alert.addedTo.length > 0;
			const isRemovedFromSubscriptionAlert = alert.removedFrom.length > 0;

			if (isSaleAlert) saleAlerts.push(alert);
			if (isReleasedAlert) releasedAlerts.push(alert);
			if (isAddedToSubscriptionAlert) addedToSubscriptionAlerts.push(alert);
			if (isRemovedFromSubscriptionAlert) removedFromSubscriptionAlerts.push(alert);

			if (isSaleAlert || (isReleasedAlert && isSale)) notified = true;

			return {
				...game,
				notified,
			};
		});

		await steamModel.updateOne({ userId: integration.userId }, { $set: { wishlist: wishlistItems } });

		for (const [category, alerts] of wishlistAlerts.entries()) {
			if (alerts.length === 0) continue;

			const user = await client.users.fetch(integration.userId);

			const title = getTitle(category, alerts.length);
			const description = getDescription(category, alerts.slice(0, 10)).join('\n');

			await user.send({
				embeds: [new MessageEmbed().setTitle(title).setDescription(description).setColor('RANDOM')],
			});

			logger.info(
				`Wishlists job notified _*${user.tag}*_ about _*${alerts.length}*_ items in _*${category}*_ category.`,
			);
		}
	}
};

const getTitle = (category: string, totalItems: number) => {
	const options: Record<string, string> = {
		'subscriptions.added':
			totalItems === 1
				? '**1** item from your wishlist is now included with a subscription service!'
				: `**${totalItems}** items from your wishlist are now included with a subscription service!`,
		'subscriptions.removed':
			totalItems === 1
				? '**1** item from your wishlist has left a subscription service!'
				: `**${totalItems}** items from your wishlist have left a subscription service!`,
		'released':
			totalItems === 1
				? '**1** item from your wishlist is now available!'
				: `**${totalItems}** items from your wishlist are now available!`,
		'sale':
			totalItems === 1
				? '**1** item from your wishlist is on sale!'
				: `**${totalItems}** items from your wishlist are on sale!`,
	};

	return options[category];
};

const getDescription = (category: string, items: Alert[]) => {
	const options: Record<string, string[]> = {
		'subscriptions.added': items.map(
			({ name, url, addedTo }) => `> **[${name}](${url})** added to:\n${addedTo.join('\n')}`,
		),
		'subscriptions.removed': items.map(
			({ name, url, removedFrom }) => `> **[${name}](${url})** removed from:\n${removedFrom.join('\n')}`,
		),
		'released': items.map(({ name, url, discounted }) => `> **[${name}](${url})** available for **${discounted}**`),
		'sale': items.map(
			({ name, url, discount, regular, discounted }) =>
				`> **[${name}](${url})** is ***${discount}%*** off! ~~${regular}~~ | **${discounted}**`,
		),
	};

	return options[category];
};
