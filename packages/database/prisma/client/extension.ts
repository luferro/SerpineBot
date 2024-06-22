import { type Feed, type FeedType, Prisma, type Subscription } from "@prisma/client";

export const extension = Prisma.defineExtension((client) => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const getContext = <T>(that: T) => Prisma.getExtensionContext(that) as any;

	return client.$extends({
		model: {
			$allModels: {
				async exists<T>(this: T, where: Pick<Prisma.Args<T, "count">, "where">) {
					const count = await getContext(this).count(where);
					return count > 0;
				},
			},
			birthday: {
				async getUpcomingBirthdays<T>(this: T) {
					return client.birthday.findMany({
						where: {
							OR: [
								{ AND: [{ day: { gte: new Date().getDate() } }, { month: { equals: new Date().getMonth() + 1 } }] },
								{ month: { gte: new Date().getMonth() + 1 } },
							],
						},
					});
				},
			},
			guild: {
				async getLocalization<T>(this: T, where: Pick<Prisma.Args<T, "findUnique">, "where">) {
					const settings = await client.guild.findUnique(where);
					if (!settings) throw new Error("Guild is not registered");
					return { locale: settings.locale, timezone: settings.timezone };
				},
			},
			feeds: {
				async getFeeds<T>(this: T, { type }: { type: FeedType }) {
					const result = await client.feeds.findUnique({ where: { type } });
					return result?.feeds ?? [];
				},
				async getFeedsByGuildId<T>(this: T, { type, guildId }: { type: FeedType; guildId: string }) {
					const result = (await client.feeds.aggregateRaw({
						pipeline: [
							{ $match: { _id: type } },
							{
								$project: {
									_id: 0,
									feeds: { $filter: { input: "$feeds", cond: { $eq: ["$$this.guildId", guildId] } } },
								},
							},
						],
					})) as unknown as { feeds: Feed[] }[];
					return result[0]?.feeds ?? [];
				},
				async getFeedsByWebhookId<T>(this: T, { type, webhookId }: { type: FeedType; webhookId: string }) {
					const result = (await client.feeds.aggregateRaw({
						pipeline: [
							{ $match: { _id: type } },
							{
								$project: {
									_id: 0,
									feeds: { $filter: { input: "$feeds", cond: { $eq: ["$$this.webhook.id", webhookId] } } },
								},
							},
						],
					})) as unknown as { feeds: Feed[] }[];
					return result[0]?.feeds ?? [];
				},
			},
			subscription: {
				async search<T>(this: T, { query }: { query: string }) {
					return client.subscription.aggregateRaw({
						pipeline: [
							{ $search: { phrase: { query, path: "entries.title" } } },
							{ $project: { _id: 0, id: { $toString: "$_id" }, name: 1, url: 1, selectors: 1, count: 1, entries: 1 } },
						],
					}) as unknown as Subscription[];
				},
			},
		},
	});
});
