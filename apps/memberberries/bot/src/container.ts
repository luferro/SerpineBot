import { Cache, RedisStore, createHash } from "@luferro/cache";
import { type Config, loadConfig } from "@luferro/config";
import { parseCronExpression } from "@luferro/utils/time";
import { container } from "@sapphire/framework";
import { ChannelType } from "discord.js";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "~/db/schema.js";
import { ExtendedGraphQLClient } from "~/graphql/client.js";
import type { PropagateCallback, WebhookType } from "./types/webhooks.js";

const config = loadConfig();
const gql = new ExtendedGraphQLClient(config.get("services.graphql.uri"));
const db = drizzle(`${config.get("services.postgres.uri")}/${config.get("client.memberberries.database")}`, { schema });
const cache = new Cache(new RedisStore(config.get("services.redis.uri")));

declare module "@sapphire/pieces" {
	interface Container {
		config: Config;
		gql: ExtendedGraphQLClient;
		db: typeof db;
		cache: Cache<unknown>;
		guildIds: string[] | undefined;

		propagate: (type: WebhookType, cb: PropagateCallback) => Promise<void>;
	}
}

container.config = config;
container.gql = gql;
container.db = db;
container.cache = cache;
container.guildIds = container.config.get<string | undefined>("client.guilds")?.split(",");

container.propagate = async (type, getMessages) => {
	for (const [guildId, guild] of container.client.guilds.cache) {
		const storedWebhooks = await container.db.query.webhooks.findMany({
			where: (webhooks, { and, eq }) => and(eq(webhooks.type, type), eq(webhooks.guildId, guildId)),
			with: { feedLinks: { with: { feed: { columns: { path: true } } } } },
		});

		for (const storedWebhook of storedWebhooks) {
			const feeds = storedWebhook.feedLinks.map((feedLink) => ({
				webhookId: feedLink.webhookId,
				feedId: feedLink.feedId,
				path: feedLink.feed.path,
				options: feedLink.options,
			}));
			const { name, skipCache, messages } = await getMessages({ guild, feeds });
			if (messages.length === 0) continue;

			const webhook = await container.client.fetchWebhook(storedWebhook.id, storedWebhook.token);
			const channel = webhook?.channel;
			if (!channel || channel.type !== ChannelType.GuildText) continue;

			for (const message of messages) {
				const pattern = container.stores.get("scheduled-tasks").get(name)?.pattern ?? null;
				const previousRunDate = pattern ? parseCronExpression(pattern).prev().toDate() : null;
				const isFirstRun = previousRunDate && previousRunDate.getTime() <= storedWebhook.updatedAt.getTime();

				const isContent = typeof message === "string";
				const hash = createHash(isContent ? message : JSON.stringify({ ...message.data, color: null }));
				const key = `message:${type}:${channel.id}:${hash}`;
				const isDuplicate = skipCache ? false : await container.cache.checkAndMarkSent(key);
				if (isFirstRun || isDuplicate) continue;

				await webhook.send(isContent ? message : { embeds: [message] });
			}
		}
	}
};
