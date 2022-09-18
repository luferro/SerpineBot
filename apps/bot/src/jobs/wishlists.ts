import type { Bot } from '../structures/bot';
import { EmbedBuilder } from 'discord.js';
import { SteamApi } from '@luferro/games-api';
import { steamModel } from '../database/models/steam';
import { logger } from '../utils/logger';
import { JobName } from '../types/enums';
import * as Subscriptions from '../services/subscriptions';
import type { AlertCategory } from '../types/category';
import type { Alert } from '../types/bot';

export const data = {
	name: JobName.Wishlists,
	schedule: '0 */15 7-23 * * *',
};

export const execute = async (client: Bot) => {
	const integrations = await steamModel.find({ notifications: true });
	for (const integration of integrations) {
		const wishlist = await SteamApi.getWishlist(integration.profile.id);
		if (!wishlist) continue;

		const alerts = new Map<AlertCategory, Alert[]>([
			['Sale', []],
			['Released', []],
			['Added To Subscription', []],
			['Removed From Subscription', []],
		]);

		const updatedWishlist = [];
		for (const game of wishlist) {
			const { name, sale, released } = game;

			const gamingSubscriptions = await Subscriptions.getGamingSubscriptions(name);
			const subscriptions = {
				xbox_game_pass: gamingSubscriptions.some(({ name }) => name === 'Xbox Game Pass'),
				pc_game_pass: gamingSubscriptions.some(({ name }) => name === 'PC Game Pass'),
				ubisoft_plus: gamingSubscriptions.some(({ name }) => name === 'Ubisoft Plus'),
				ea_play_pro: gamingSubscriptions.some(({ name }) => name === 'EA Play Pro'),
				ea_play: gamingSubscriptions.some(({ name }) => name === 'EA Play'),
			};

			const storedItem = integration.wishlist.find(({ name: storedItemName }) => storedItemName === name);
			let notified = storedItem?.notified ?? false;

			const addedTo = [];
			const removedFrom = [];
			if (storedItem) {
				for (const [subscription, isInCatalog] of Object.entries(subscriptions)) {
					const storedSubscription = Object.entries(storedItem.subscriptions).find(
						([key]) => key === subscription,
					);
					if (!storedSubscription) continue;

					const { 1: storedItemIsInCatalog } = storedSubscription;
					const formmattedSubscription = `> • **${subscription.replace(/_/g, ' ').toUpperCase()}**`;

					const addedToSubscription = !storedItemIsInCatalog && isInCatalog;
					if (addedToSubscription) addedTo.push(formmattedSubscription);

					const removedFromSubscription = storedItemIsInCatalog && !isInCatalog;
					if (removedFromSubscription) removedFrom.push(formmattedSubscription);
				}
			}

			const alert = { ...game, addedTo, removedFrom };

			const isRelease = !(storedItem?.released ?? released) && released;
			if (isRelease) {
				alerts.get('Released')?.push(alert);
				if (sale) notified = true;
			}

			const isSale = !(storedItem?.sale ?? sale) && sale && released;
			if (isSale && !notified) {
				alerts.get('Sale')?.push(alert);
				notified = true;
			}

			const isAddedToSubscription = alert.addedTo.length > 0;
			if (isAddedToSubscription) alerts.get('Added To Subscription')?.push(alert);

			const isRemovedFromSubscription = alert.removedFrom.length > 0;
			if (isRemovedFromSubscription) alerts.get('Removed From Subscription')?.push(alert);

			updatedWishlist.push({
				...game,
				subscriptions,
				notified,
				released: storedItem?.released || game.released,
			});
		}

		await steamModel.updateOne({ userId: integration.userId }, { $set: { wishlist: updatedWishlist } });

		for (const [category, categoryAlerts] of alerts.entries()) {
			const totalItems = categoryAlerts.length;
			if (totalItems === 0) continue;

			const title = getTitle(category, totalItems);
			const description = getDescription(category, categoryAlerts).join('\n');
			const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor('Random');

			const user = await client.users.fetch(integration.userId);
			await user.send({ embeds: [embed] });

			logger.info(
				`Wishlists job sent a message to _*${user.tag}*_ about _*${totalItems}*_ update(s) in _*${category}*_ category.`,
			);
		}
	}
};

const getTitle = (category: AlertCategory, totalItems: number) => {
	const options: Record<typeof category, string> = {
		'Added To Subscription': `**${totalItems}** item(s) from your wishlist now included with a subscription service.`,
		'Removed From Subscription': `**${totalItems}** item(s) from your wishlist removed from a subscription service.`,
		'Released': `**${totalItems}** item(s) from your wishlist now available for purchase.`,
		'Sale': `**${totalItems}** items from your wishlist on sale.`,
	};
	return options[category];
};

const getDescription = (category: AlertCategory, items: Alert[]) => {
	const array = items.slice(10);
	const options: Record<typeof category, string[]> = {
		'Added To Subscription': array.map(
			({ name, url, addedTo }) => `> **[${name}](${url})** added to:\n${addedTo.join('\n')}`,
		),
		'Removed From Subscription': array.map(
			({ name, url, removedFrom }) => `> **[${name}](${url})** removed from:\n${removedFrom.join('\n')}`,
		),
		'Released': array.map(({ name, url, discounted }) => `> **[${name}](${url})** available for **${discounted}**`),
		'Sale': array.map(
			({ name, url, discount, regular, discounted }) =>
				`> **[${name}](${url})** is ***${discount}%*** off! ~~${regular}~~ | **${discounted}**`,
		),
	};
	return options[category];
};
