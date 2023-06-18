import { IntegrationsModel, SteamIntegration, SubscriptionsModel, WishlistEntry } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { Bot } from '../../structures/Bot';
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

		const wishlist = await client.api.gaming.steam.getWishlist(integration.profile.id);
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

const getTitle = (category: Alert, totalItems: number) => {
	const select: Record<typeof category, string> = {
		[Alert.Sale]: `**${totalItems}** items from your wishlist on sale.`,
		[Alert.Released]: `**${totalItems}** item(s) from your wishlist now available for purchase.`,
		[Alert.AddedTo]: `**${totalItems}** item(s) from your wishlist now included with a subscription service.`,
		[Alert.RemovedFrom]: `**${totalItems}** item(s) from your wishlist removed from a subscription service.`,
	};
	return select[category];
};

const getDescription = (category: Alert, items: SteamAlert[]) => {
	const select: Record<typeof category, string[]> = {
		[Alert.Sale]: items.map(
			({ name, url, discount, regular, discounted }) =>
				`> **[${name}](${url})** is ***${discount}%*** off! ~~${regular}~~ | **${discounted}**`,
		),
		[Alert.Released]: items.map(
			({ name, url, discounted }) => `> **[${name}](${url})** available for **${discounted}**`,
		),
		[Alert.AddedTo]: items.map(
			({ name, url, addedTo }) => `> **[${name}](${url})** added to:\n${(addedTo ?? []).join('\n')}`,
		),
		[Alert.RemovedFrom]: items.map(
			({ name, url, removedFrom }) => `> **[${name}](${url})** removed from:\n${(removedFrom ?? []).join('\n')}`,
		),
	};
	return select[category].join('\n');
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

		const embed = new EmbedBuilder()
			.setTitle(getTitle(category, queue.length))
			.setDescription(getDescription(category, queue.slice(0, 10)))
			.setColor('Random');

		const user = await client.users.fetch(userId);
		await user.send({ embeds: [embed] });

		logger.info(`Steam alerts sent to **${user.username}** (**${category}** | **${queue.length}** update(s)).`);
		logger.debug({ queue });
	}
};
