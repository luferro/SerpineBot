import { Cache, RedisStore, createHash } from "@luferro/cache";
import { type Config, loadConfig } from "@luferro/config";
import { parseCronExpression } from "@luferro/utils/time";
import { container } from "@sapphire/framework";
import { ChannelType } from "discord.js";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "~/db/schema.js";
import { ExtendedGraphQLClient } from "~/graphql/client.js";
import type { PropagateCallback, WebhookMessage, WebhookType } from "./types/webhooks.js";

type InferredWebhookFeed = typeof schema.webhookFeeds.$inferSelect & { feed: { path: string } };
type InferredWebhook = typeof schema.webhooks.$inferSelect & { feeds: InferredWebhookFeed[] };

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
		getWebhooks: (guildId: string, type: WebhookType) => Promise<InferredWebhook[]>;
	}
}

container.config = config;
container.gql = gql;
container.db = db;
container.cache = cache;
container.guildIds = container.config.get<string | undefined>("client.guilds")?.split(",");

container.getWebhooks = async (guildId, type) => {
	return await container.db.query.webhooks.findMany({
		where: (webhooks, { and, eq, sql }) =>
			and(
				eq(webhooks.guildId, guildId),
				sql`EXISTS (SELECT 1 FROM webhook_types wt WHERE wt.webhook_id = ${webhooks.id} AND wt.type = ${type})`,
			),
		with: {
			feeds: {
				where: (webhookFeeds, { eq }) => eq(webhookFeeds.type, type),
				with: { feed: { columns: { path: true } } },
			},
		},
	});
};

container.propagate = async (type, getMessages) => {
	const getContentsToHash = (message: WebhookMessage) => {
		const urlRegex = /https?:\/\/[^\s'"<>]+/g;
		const contentsToHash =
			typeof message === "string"
				? [message.replaceAll(urlRegex, "<url>"), message.match(urlRegex)?.at(-1)]
				: [JSON.stringify({ ...message.data, color: null }), message.data.title, message.data.url];
		return contentsToHash.filter((content): content is NonNullable<string> => Boolean(content));
	};

	const isDuplicateMessage = async (channelId: string, message: WebhookMessage, skipCache = false) => {
		if (skipCache) return false;

		let isDuplicate = false;
		for (const contentToHash of getContentsToHash(message)) {
			if (isDuplicate) break;
			const key = `message:${type}:${channelId}:${createHash(contentToHash)}`;
			isDuplicate = await container.cache.checkAndMarkSent(key);
		}

		return isDuplicate;
	};

	for (const [guildId, guild] of container.client.guilds.cache) {
		const registeredWebhooks = await container.getWebhooks(guildId, type);
		for (const registeredWebhook of registeredWebhooks) {
			const feeds = registeredWebhook.feeds.map(({ webhookId, feedId, feed, options }) => ({
				webhookId,
				feedId,
				options,
				path: feed.path,
			}));
			const { name, skipCache, messages } = await getMessages({ guild, feeds });
			if (messages.length === 0) continue;

			const webhook = await container.client.fetchWebhook(registeredWebhook.id, registeredWebhook.token);
			const channel = webhook?.channel;
			if (!channel || channel.type !== ChannelType.GuildText) continue;

			for (const message of messages) {
				const pattern = container.stores.get("scheduled-tasks").get(name)?.pattern ?? null;
				const previousRunDate = pattern ? parseCronExpression(pattern).prev().toDate() : null;
				const isFirstRun = previousRunDate && previousRunDate.getTime() <= registeredWebhook.updatedAt.getTime();

				const isDuplicate = await isDuplicateMessage(channel.id, message, skipCache);
				if (isFirstRun || isDuplicate) continue;

				await webhook.send(typeof message === "string" ? message : { embeds: [message] });
			}
		}
	}
};
