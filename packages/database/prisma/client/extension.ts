import { Prisma, Subscription, WebhookType } from "@prisma/client";

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
			guild: {
				async getLocalization<T>(this: T, where: Pick<Prisma.Args<T, "findFirst">, "where">) {
					const guild = await client.guild.findFirst(where);
					if (!guild) throw new Error("Guild is not registered");
					return { locale: guild.locale, timezone: guild.timezone };
				},
			},
			config: {
				async getWebhookConfig<T>(this: T, { webhook }: { webhook: WebhookType }) {
					const config = await client.config.findFirst();
					const webhookConfig = config?.webhooks.find((item) => item.webhook === webhook);
					if (!webhookConfig) throw new Error("Webhook config does not exist");

					return { feeds: webhookConfig.feeds, subreddits: webhookConfig.subreddits };
				},
			},
			subscription: {
				async search<T>(this: T, { query }: { query: string }) {
					const results = (await client.subscription.aggregateRaw({
						pipeline: [{ $search: { phrase: { query, path: "catalog.title" } } }],
					})) as unknown as Subscription[];

					return results;
				},
			},
		},
	});
});
