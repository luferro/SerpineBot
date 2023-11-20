import { SteamWishlistEntry } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import type { Bot } from '../../structures/Bot';
import type { JobData, JobExecute } from '../../types/bot';

enum Alert {
	Sale = 'sale',
	Released = 'released',
	AddedTo = 'addedTo',
	RemovedFrom = 'removedFrom',
}

type SteamAlert = { addedTo?: string[]; removedFrom?: string[] } & SteamWishlistEntry;

type Entries<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T][];

export const data: JobData = { schedule: '0 */15 7-23 * * *' };

export const execute: JobExecute = async ({ client }) => {
	const integrations = await client.prisma.steam.findMany({ where: { notifications: true } });
	for (const integration of integrations) {
		const alerts: Record<Alert, SteamAlert[]> = {
			[Alert.Sale]: [],
			[Alert.Released]: [],
			[Alert.AddedTo]: [],
			[Alert.RemovedFrom]: [],
		};

		const wishlist = await client.api.gaming.platforms.steam.getWishlist({ id: integration.profile.id });
		if (!wishlist || wishlist.length === 0) continue;

		const updatedWishlist = await Promise.all(
			wishlist.map(async (game) => {
				const storedGame = integration.wishlist.find((storedGame) => storedGame.title === game.title);
				const subscriptions = await client.prisma.subscription.search({ query: game.title });

				const updatedEntry = {
					...game,
					notified: storedGame?.notified ?? false,
					subscriptions: subscriptions.map((subscription) => subscription.type),
				};

				const wasSale = storedGame?.onSale ?? game.onSale;
				if (!wasSale && game.onSale && !updatedEntry.notified) {
					alerts[Alert.Sale].push(updatedEntry);
					updatedEntry.notified = true;
				}

				const wasReleased = storedGame?.isReleased ?? game.isReleased;
				if (!wasReleased && game.isReleased) alerts[Alert.Released].push(updatedEntry);

				const { addedTo, removedFrom } = getSubscriptionChanges(updatedEntry, storedGame);
				if (addedTo.length > 0) alerts[Alert.AddedTo].push({ ...updatedEntry, addedTo });
				if (removedFrom.length > 0) alerts[Alert.RemovedFrom].push({ ...updatedEntry, removedFrom });

				return updatedEntry;
			}),
		);

		await notifyUser(client, integration.userId, alerts);

		await client.prisma.steam.update({
			where: { userId: integration.userId },
			data: { wishlist: updatedWishlist },
		});
	}
};

const getSubscriptionChanges = (newGame: SteamWishlistEntry, oldGame?: SteamWishlistEntry) => {
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
	for (const [alert, queue] of Object.entries(alerts) as unknown as Entries<typeof alerts>) {
		if (queue.length === 0) continue;

		const user = await client.users.fetch(userId);

		const embed = new EmbedBuilder()
			.setTitle(t(`jobs.gaming.wishlists.${alert}.embed.title`, { size: queue.length }))
			.setDescription(
				queue
					.slice(0, 10)
					.map(
						({ title, url, discount, discounted, regular, addedTo, removedFrom }) =>
							`> ${t(`jobs.gaming.wishlists.${alert}.embed.description`, {
								item: `**[${title}](${url})**`,
								discount: `***${discount}%***`,
								regular: `~~${regular}~~`,
								discounted: `**${discounted}**`,
								addedTo: (addedTo ?? []).join('\n'),
								removedFrom: (removedFrom ?? []).join('\n'),
							})}`,
					)
					.join('\n'),
			)
			.setColor('Random');

		await user.send({ embeds: [embed] });
		logger.info(`Steam alerts sent to **${user.username}** (**${alert}** | **${queue.length}** update(s)).`);
		logger.debug({ queue });
	}
};
