import { IntegrationsModel, SteamIntegration, SubscriptionsModel, WishlistEntry } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import type { Bot } from '../../Bot';
import type { JobData, JobExecute } from '../../types/bot';

enum Alert {
	Sale = 'sale',
	Released = 'released',
	AddedTo = 'addedTo',
	RemovedFrom = 'removedFrom',
}

type SteamAlert = { addedTo?: string[]; removedFrom?: string[] } & WishlistEntry;

type Entries<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T][];

export const data: JobData = { schedule: '0 */15 7-23 * * *' };

export const execute: JobExecute = async ({ client }) => {
	const integrations = await IntegrationsModel.getIntegrations<SteamIntegration>({
		category: 'Steam',
		notifications: true,
	});
	for (const integration of integrations) {
		const alerts: Record<Alert, SteamAlert[]> = {
			[Alert.Sale]: [],
			[Alert.Released]: [],
			[Alert.AddedTo]: [],
			[Alert.RemovedFrom]: [],
		};

		const wishlist = await client.api.gaming.steam.getWishlist({ steamId64: integration.profile.id });
		if (!wishlist) continue;

		const updatedWishlist = await Promise.all(
			wishlist.map(async (game) => {
				const storedGame = integration.wishlist.find(({ name }) => name === game.name);
				const subscriptions = await SubscriptionsModel.getMatches({ name: game.name });

				const updatedEntry = {
					...game,
					notified: storedGame?.notified ?? false,
					released: storedGame?.released || game.released,
					subscriptions: {
						xbox_game_pass: subscriptions.some(({ provider }) => provider === 'Xbox Game Pass'),
						pc_game_pass: subscriptions.some(({ provider }) => provider === 'PC Game Pass'),
						ubisoft_plus: subscriptions.some(({ provider }) => provider === 'Ubisoft Plus'),
						ea_play_pro: subscriptions.some(({ provider }) => provider === 'EA Play Pro'),
						ea_play: subscriptions.some(({ provider }) => provider === 'EA Play'),
					},
				};

				const wasSale = storedGame?.sale ?? game.sale;
				if (!wasSale && game.sale && !updatedEntry.notified) alerts[Alert.Sale].push(updatedEntry);

				const wasReleased = storedGame?.released ?? game.released;
				if (!wasReleased && game.released) alerts[Alert.Released].push(updatedEntry);

				const { addedTo, removedFrom } = getSubscriptionChanges(updatedEntry, storedGame);
				if (addedTo.length > 0) alerts[Alert.AddedTo].push({ ...updatedEntry, addedTo });
				if (removedFrom.length > 0) alerts[Alert.RemovedFrom].push({ ...updatedEntry, removedFrom });

				updatedEntry.notified = !wasSale && game.sale;
				return updatedEntry;
			}),
		);

		await notifyUser(client, integration.userId, alerts);

		await IntegrationsModel.updateWishlist({ userId: integration.userId, wishlist: updatedWishlist });
	}
};

const getSubscriptionChanges = (newGame: WishlistEntry, oldGame?: WishlistEntry) => {
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

const notifyUser = async (client: Bot, userId: string, alerts: Record<Alert, SteamAlert[]>) => {
	for (const [category, queue] of Object.entries(alerts) as unknown as Entries<typeof alerts>) {
		if (queue.length === 0) continue;

		const title = t(`jobs.gaming.wishlists.${category}.embed.title`, { size: queue.length });
		const description = queue
			.slice(0, 10)
			.map(
				({ name, url, discount, discounted, regular, addedTo, removedFrom }) =>
					`> ${t(`jobs.gaming.wishlists.${category}.embed.description`, {
						item: `**[${name}](${url})**`,
						discount: `***${discount}%***`,
						regular: `~~${regular}~~`,
						discounted: `**${discounted}**`,
						addedTo: (addedTo ?? []).join('\n'),
						removedFrom: (removedFrom ?? []).join('\n'),
					})}`,
			)
			.join('\n');

		const user = await client.users.fetch(userId);
		const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor('Random');
		await user.send({ embeds: [embed] });

		logger.info(`Steam alerts sent to **${user.username}** (**${category}** | **${queue.length}** update(s)).`);
		logger.debug({ queue });
	}
};
