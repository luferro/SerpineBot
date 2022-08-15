import { EmbedBuilder } from 'discord.js';
import { Bot } from '../bot';
import * as Steam from '../apis/steam';
import { steamModel } from '../database/models/steam';
import { Alert } from '../types/alerts';
import { logger } from '../utils/logger';
import { AlertCategory, JobName } from '../types/enums';

export const data = {
	name: JobName.Wishlists,
	schedule: '0 */15 7-23 * * *',
};

export const execute = async (client: Bot) => {
	const integrations = await steamModel.find({ notifications: true });
	for (const integration of integrations) {
		const wishlist = await Steam.getWishlist(integration.profile.id);
		if (!wishlist) continue;

		const wishlistAlerts = new Map<AlertCategory, Alert[]>([
			[AlertCategory.Sale, []],
			[AlertCategory.Released, []],
			[AlertCategory.AddedToSubscription, []],
			[AlertCategory.RemovedFromSubscription, []],
		]);
		const wishlistItems = wishlist.map((game) => {
			const { name, url, discount, regular, discounted, subscriptions, sale, released } = game;

			const alert: Alert = {
				name,
				url,
				discount,
				regular,
				discounted,
				addedTo: [],
				removedFrom: [],
			};

			const storedItem = integration.wishlist.find(({ name: storedItemName }) => storedItemName === name);
			if (storedItem) {
				for (const [subscription, itemIsInSubscription] of Object.entries(subscriptions)) {
					const formmattedSubscription = `> • **${subscription.replace(/_/g, ' ').toUpperCase()}**`;

					const { 1: storedItemIsInSubscription } = Object.entries(storedItem.subscriptions).find(
						([key]) => key === subscription,
					)!;

					const addedToSubscription = !storedItemIsInSubscription && itemIsInSubscription;
					if (addedToSubscription) alert.addedTo.push(formmattedSubscription);

					const removedFromSubscription = storedItemIsInSubscription && !itemIsInSubscription;
					if (removedFromSubscription) alert.removedFrom.push(formmattedSubscription);
				}
			}

			let notified = storedItem?.notified ?? false;

			const wasRelease = storedItem?.released ?? released;
			const isRelease = !wasRelease && released;
			if (isRelease) {
				wishlistAlerts.get(AlertCategory.Released)!.push(alert);
				if (sale) notified = true;
			}

			const wasSale = storedItem?.sale ?? sale;
			const isSale = !wasSale && sale && released;
			if (isSale && !notified) {
				wishlistAlerts.get(AlertCategory.Sale)!.push(alert);
				notified = true;
			}

			const isAddedToSubscription = alert.addedTo.length > 0;
			if (isAddedToSubscription) wishlistAlerts.get(AlertCategory.AddedToSubscription)!.push(alert);

			const isRemovedFromSubscription = alert.removedFrom.length > 0;
			if (isRemovedFromSubscription) wishlistAlerts.get(AlertCategory.RemovedFromSubscription)!.push(alert);

			return {
				...game,
				released: storedItem?.released || game.released,
				notified,
			};
		});

		await steamModel.updateOne({ userId: integration.userId }, { $set: { wishlist: wishlistItems } });

		for (const [category, alerts] of wishlistAlerts.entries()) {
			if (alerts.length === 0) continue;

			const title = getTitle(category, alerts.length);
			const description = getDescription(category, alerts.slice(0, 10)).join('\n');
			const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor('Random');

			const user = await client.users.fetch(integration.userId);
			await user.send({ embeds: [embed] });

			logger.info(
				`Wishlists job notified _*${user.tag}*_ about _*${alerts.length}*_ items in _*${AlertCategory[category]}*_ category.`,
			);
		}
	}
};

const getTitle = (category: AlertCategory, totalItems: number) => {
	const options: Record<typeof category, string> = {
		[AlertCategory.AddedToSubscription]:
			totalItems === 1
				? '**1** item from your wishlist is now included with a subscription service!'
				: `**${totalItems}** items from your wishlist are now included with a subscription service!`,
		[AlertCategory.RemovedFromSubscription]:
			totalItems === 1
				? '**1** item from your wishlist has left a subscription service!'
				: `**${totalItems}** items from your wishlist have left a subscription service!`,
		[AlertCategory.Released]:
			totalItems === 1
				? '**1** item from your wishlist is now available!'
				: `**${totalItems}** items from your wishlist are now available!`,
		[AlertCategory.Sale]:
			totalItems === 1
				? '**1** item from your wishlist is on sale!'
				: `**${totalItems}** items from your wishlist are on sale!`,
	};

	return options[category];
};

const getDescription = (category: AlertCategory, items: Alert[]) => {
	const options: Record<typeof category, string[]> = {
		[AlertCategory.AddedToSubscription]: items.map(
			({ name, url, addedTo }) => `> **[${name}](${url})** added to:\n${addedTo.join('\n')}`,
		),
		[AlertCategory.RemovedFromSubscription]: items.map(
			({ name, url, removedFrom }) => `> **[${name}](${url})** removed from:\n${removedFrom.join('\n')}`,
		),
		[AlertCategory.Released]: items.map(
			({ name, url, discounted }) => `> **[${name}](${url})** available for **${discounted}**`,
		),
		[AlertCategory.Sale]: items.map(
			({ name, url, discount, regular, discounted }) =>
				`> **[${name}](${url})** is ***${discount}%*** off! ~~${regular}~~ | **${discounted}**`,
		),
	};

	return options[category];
};
