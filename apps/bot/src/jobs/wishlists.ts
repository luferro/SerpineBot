import type { Bot } from '../structures/bot';
import type { SteamAlert, JobData } from '../types/bot';
import type { AlertCategory } from '../types/category';
import type { SteamWishlistItem } from '../types/schemas';
import { EmbedBuilder } from 'discord.js';
import { SteamApi } from '@luferro/games-api';
import { logger } from '@luferro/shared-utils';
import { steamModel } from '../database/models/steam';
import { JobName } from '../types/enums';
import * as Subscriptions from '../services/subscriptions';

type Entries<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T][];

export const data: JobData = {
	name: JobName.Wishlists,
	schedule: '0 */15 7-23 * * *',
};

export const execute = async (client: Bot) => {
	await updateSteamWishlist(client);
};

const getTitle = (category: AlertCategory, totalItems: number) => {
	const select: Record<typeof category, string> = {
		'Added To Subscription': `**${totalItems}** item(s) from your wishlist now included with a subscription service.`,
		'Removed From Subscription': `**${totalItems}** item(s) from your wishlist removed from a subscription service.`,
		'Released': `**${totalItems}** item(s) from your wishlist now available for purchase.`,
		'Sale': `**${totalItems}** items from your wishlist on sale.`,
	};
	return select[category];
};

const getDescription = (category: AlertCategory, items: SteamAlert[]) => {
	const select: Record<typeof category, string[]> = {
		'Sale': items.map(
			({ name, url, discount, regular, discounted }) =>
				`> **[${name}](${url})** is ***${discount}%*** off! ~~${regular}~~ | **${discounted}**`,
		),
		'Released': items.map(({ name, url, discounted }) => `> **[${name}](${url})** available for **${discounted}**`),
		'Added To Subscription': items.map(
			({ name, url, addedTo }) => `> **[${name}](${url})** added to:\n${(addedTo ?? []).join('\n')}`,
		),
		'Removed From Subscription': items.map(
			({ name, url, removedFrom }) => `> **[${name}](${url})** removed from:\n${(removedFrom ?? []).join('\n')}`,
		),
	};
	return select[category];
};

const getGameSubscriptionChanges = (newGame: SteamWishlistItem, oldGame?: SteamWishlistItem) => {
	const addedTo = [];
	const removedFrom = [];
	for (const [name, isIncluded] of Object.entries(newGame.subscriptions)) {
		if (!oldGame) break;

		const storedSubscription = Object.entries(newGame.subscriptions).find(([key]) => key === name);
		if (!storedSubscription) continue;

		const subscription = name.replace(/_/g, ' ').toUpperCase();
		const { 1: storedItemIsIncluded } = storedSubscription;
		if (!storedItemIsIncluded && isIncluded) addedTo.push(`> • **${subscription}**`);
		if (storedItemIsIncluded && !isIncluded) removedFrom.push(`> • **${subscription}**`);
	}

	return { addedTo, removedFrom };
};

const updateSteamWishlist = async (client: Bot) => {
	const integrations = await steamModel.find({ notifications: true });
	for (const integration of integrations) {
		const alerts: Record<AlertCategory, SteamAlert[]> = {
			'Sale': [],
			'Released': [],
			'Added To Subscription': [],
			'Removed From Subscription': [],
		};

		const wishlist = await SteamApi.getWishlist(integration.profile.id);
		if (!wishlist) continue;

		const updatedWishlist = await Promise.all(
			wishlist.map(async (game) => {
				const storedGame = integration.wishlist.find(({ name }) => name === game.name);
				const rawSubscriptions = await Subscriptions.getGamingSubscriptions(game.name);

				const updatedEntry = {
					...game,
					notified: storedGame?.notified ?? false,
					released: storedGame?.released ?? game.released,
					subscriptions: {
						xbox_game_pass: rawSubscriptions.some(({ name }) => name === 'Xbox Game Pass'),
						pc_game_pass: rawSubscriptions.some(({ name }) => name === 'PC Game Pass'),
						ubisoft_plus: rawSubscriptions.some(({ name }) => name === 'Ubisoft Plus'),
						ea_play_pro: rawSubscriptions.some(({ name }) => name === 'EA Play Pro'),
						ea_play: rawSubscriptions.some(({ name }) => name === 'EA Play'),
					},
				};

				const wasSale = storedGame?.sale ?? game.sale;
				if (!wasSale && game.sale && !updatedEntry.notified) {
					updatedEntry.notified = true;
					alerts['Sale'].push(updatedEntry);
				}

				const wasReleased = storedGame?.released ?? game.released;
				if (!wasReleased && game.released) {
					updatedEntry.notified = game.sale || updatedEntry.notified;
					alerts['Released'].push(updatedEntry);
				}

				const { addedTo, removedFrom } = getGameSubscriptionChanges(updatedEntry, storedGame);
				if (addedTo.length > 0) alerts['Added To Subscription'].push({ ...updatedEntry, addedTo });
				if (removedFrom.length > 0) alerts['Removed From Subscription'].push({ ...updatedEntry, removedFrom });

				return updatedEntry;
			}),
		);
		await steamModel.updateOne({ userId: integration.userId }, { $set: { wishlist: updatedWishlist } });

		await notifyUser(client, integration.userId, alerts);
	}
};

const notifyUser = async (client: Bot, userId: string, alertsPerCategory: Record<AlertCategory, SteamAlert[]>) => {
	for (const [category, alerts] of Object.entries(alertsPerCategory) as Entries<typeof alertsPerCategory>) {
		if (alerts.length === 0) continue;

		const embed = new EmbedBuilder()
			.setTitle(getTitle(category, alerts.length))
			.setDescription(getDescription(category, alerts.slice(0, 10)).join('\n'))
			.setColor('Random');

		const user = await client.users.fetch(userId);
		await user.send({ embeds: [embed] });

		const message = `Job **${data.name}** notified **${user.tag}** about **${alerts.length}** update(s) in **${category}** category.`;
		logger.info(message);
		logger.debug(JSON.stringify(alerts));
	}
};
