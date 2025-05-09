import { container } from "@sapphire/pieces";
import { ScheduledTask } from "@sapphire/plugin-scheduled-tasks";
import { EmbedBuilder } from "discord.js";
import { and, eq } from "drizzle-orm";
import { integrations } from "~/db/schema.js";
import type { Integration, SteamProfile, SteamWishlistAlerts, SteamWishlistItem } from "~/types/integrations.js";

export class WishlistsTask extends ScheduledTask {
	public constructor(context: ScheduledTask.LoaderContext, options: ScheduledTask.Options) {
		super(context, {
			...options,
			pattern: "0 */15 7-23 * * *",
			timezone: container.config.timezone,
		});
	}

	public async run() {
		const wishlists = [this.updateSteamWishlist.bind(this)];

		const integrations = await this.container.db.query.integrations.findMany();
		for (const integration of integrations) {
			const user = await this.container.client.users.fetch(integration.userId);
			for (const updateWishlist of wishlists) {
				const { alerts } = await updateWishlist(integration as Integration);

				if (!integration.notifications) continue;

				for (const alert of alerts) {
					const embed = new EmbedBuilder()
						.setTitle(alert.title)
						.setDescription(alert.description.slice(0, 10).join("\n"))
						.setColor("Random");

					await user.send({ embeds: [embed] });
				}
			}
		}
	}

	private async updateSteamWishlist(userIntegration: Integration<SteamProfile, SteamWishlistItem>) {
		const newWishlist = await this.container.gql.steam
			.getWishlist({ steamId64: userIntegration.profile.id })
			.catch(() => null);
		if (!newWishlist || newWishlist.length === 0) throw new Error("Failed to retrieve wishlist");

		const [wishlist, { sale, released }] = newWishlist.reduce<[SteamWishlistItem[], SteamWishlistAlerts]>(
			(acc, newEntry) => {
				const oldEntry = userIntegration.wishlist.find((oldEntry) => oldEntry.id === newEntry.id);

				const updatedEntry = {
					...newEntry,
					notified: {
						sale: oldEntry?.notified.sale ?? Boolean(newEntry.discount),
						release: oldEntry?.notified.release ?? newEntry.isReleased,
					},
				};

				const isRelease = !oldEntry?.isReleased && newEntry.isReleased;
				if (isRelease && !updatedEntry.notified.release) {
					acc[1].released.push(
						`\`${updatedEntry.priority}.\` **[${updatedEntry.title}](${updatedEntry.url})** is now available for **${updatedEntry.discounted}**`,
					);
					updatedEntry.notified.release = true;
				}

				if (!isRelease && !oldEntry?.discount && Boolean(newEntry.discount) && !updatedEntry.notified.sale) {
					acc[1].sale.push(
						`\`${updatedEntry.priority}.\` **[${updatedEntry.title}](${updatedEntry.url})** is ***${updatedEntry.discount}%*** off! ~~${updatedEntry.regular}~~ | **${updatedEntry.discounted}**`,
					);
				}

				updatedEntry.notified.sale = Boolean(newEntry.discount);
				acc[0].push(updatedEntry);
				return acc;
			},
			[[], { sale: [], released: [] }],
		);

		await this.container.db
			.update(integrations)
			.set({ wishlist })
			.where(and(eq(integrations.type, "steam"), eq(integrations.userId, userIntegration.userId)));

		return {
			wishlist,
			alerts: [
				{
					title: `${sale.length} item(s) from your Steam wishlist on sale!`,
					description: sale,
				},
				{
					title: `${released.length} item(s) from your Steam wishlist now available for purchase!`,
					description: released,
				},
			].filter((alert) => alert.description.length > 0),
		};
	}
}
