import type { SteamWishlistEntry } from "@luferro/database";
import { formatCurrency } from "@luferro/helpers/currency";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import type { Bot } from "~/structures/Bot.js";
import type { JobData, JobExecute } from "~/types/bot.js";

type Alert = "sale" | "released" | "addedTo" | "removedFrom";
type Entry = SteamWishlistEntry & { addedTo?: string[]; removedFrom?: string[] };
type Alerts = Record<Alert, Entry[]>;
type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];

export const data: JobData = { schedule: "0 */15 7-23 * * *" };

export const execute: JobExecute = async ({ client }) => {
	const integrations = await client.db.steam.findMany();
	for (const integration of integrations) {
		const alerts: Alerts = { sale: [], released: [], addedTo: [], removedFrom: [] };

		const wishlist = await client.api.gaming.platforms.steam.getWishlist(integration.profile.id).catch(() => null);
		if (!wishlist || wishlist.length === 0) continue;

		const updatedWishlist = await Promise.all(
			wishlist.map(async (newEntry) => {
				const oldEntry = integration.wishlist.find((oldEntry) => oldEntry.id === newEntry.id);
				const subscriptions = await client.db.subscription.search({ query: newEntry.title });

				const updatedEntry = {
					...newEntry,
					notified: {
						sale: oldEntry?.notified.sale ?? newEntry.onSale,
						release: oldEntry?.notified.release ?? newEntry.isReleased,
					},
					subscriptions: subscriptions.map((subscription) => subscription.type),
				};
				if (!oldEntry) return updatedEntry;

				const isRelease = !oldEntry.isReleased && newEntry.isReleased;
				if (isRelease && !updatedEntry.notified.release) {
					alerts.released.push(updatedEntry);
					updatedEntry.notified.release = true;
				}

				const isSale = !oldEntry.onSale && newEntry.onSale;
				if (!isRelease && isSale && !updatedEntry.notified.sale) alerts.sale.push(updatedEntry);

				const { addedTo, removedFrom } = getSubscriptionChanges(updatedEntry, oldEntry);
				if (addedTo.length > 0) alerts.addedTo.push({ ...updatedEntry, addedTo });
				if (removedFrom.length > 0) alerts.removedFrom.push({ ...updatedEntry, removedFrom });

				updatedEntry.notified.sale = isSale;

				return updatedEntry;
			}),
		);

		if (integration.notifications) await notifyUser(client, integration.userId, alerts);

		await client.db.steam.update({
			where: { userId: integration.userId },
			data: { wishlist: updatedWishlist },
		});
	}
};

const getSubscriptionChanges = (newEntry: SteamWishlistEntry, oldEntry: SteamWishlistEntry) => {
	const addedTo = [];
	const removedFrom = [];
	for (const [name, newEntryIsIncluded] of Object.entries(newEntry.subscriptions)) {
		const oldSubscription = Object.entries(oldEntry.subscriptions).find(([key]) => key === name);
		if (!oldSubscription) continue;

		const subscription = name.replace(/_/g, " ").toUpperCase();
		const { 1: oldEntryIsIncluded } = oldSubscription;
		if (!oldEntryIsIncluded && newEntryIsIncluded) addedTo.push(`> • **${subscription}**`);
		if (oldEntryIsIncluded && !newEntryIsIncluded) removedFrom.push(`> • **${subscription}**`);
	}

	return { addedTo, removedFrom };
};

const notifyUser = async (client: Bot, userId: string, alerts: Alerts) => {
	for (const [alert, queue] of Object.entries(alerts) as unknown as Entries<typeof alerts>) {
		if (queue.length === 0) continue;

		const localization = client.getLocalization();
		const user = await client.users.fetch(userId);

		const embed = new EmbedBuilder()
			.setTitle(t(`jobs.gaming.wishlists.${alert}.embed.title`, { size: queue.length }))
			.setDescription(
				queue
					.slice(0, 10)
					.map(
						({ priority, title, url, discount, discounted, regular, addedTo, removedFrom }) =>
							`\`${priority}.\` ${t(`jobs.gaming.wishlists.${alert}.embed.description`, {
								item: `**[${title}](${url})**`,
								discount: `***${discount}%***`,
								regular: `~~${formatCurrency(regular!, localization)}~~`,
								discounted: `**${formatCurrency(discounted!, localization)}**`,
								price: `**${formatCurrency(discounted || regular!, localization)}**`,
								addedTo: (addedTo ?? []).join("\n"),
								removedFrom: (removedFrom ?? []).join("\n"),
							})}`,
					)
					.join("\n"),
			)
			.setColor("Random");

		await user.send({ embeds: [embed] });
		client.logger.info(`Steam wishlist | ${alert} | Notified ${user.username} about ${queue.length} update(s) `);
		client.logger.debug({ queue });
	}
};
