import "@sapphire/plugin-scheduled-tasks/register";

import { type Config, loadConfig } from "@luferro/config";
import {
	ApplicationCommandRegistries,
	LogLevel,
	RegisterBehavior,
	SapphireClient,
	container,
} from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import { ChannelType } from "discord.js";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "~/db/schema.js";
import { ExtendedGraphQLClient } from "~/graphql/client.js";
import type { WebhookFeed, WebhookMessage, WebhookType } from "./types/webhooks.js";

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

export const timezone = "Europe/Lisbon";

const config = loadConfig();
const gql = new ExtendedGraphQLClient(config.get("services.graphql.uri"));
const db = drizzle(config.get("services.postgres.uri").concat("/memberberries"), { schema });

declare module "@sapphire/pieces" {
	interface Container {
		config: Config;
		gql: ExtendedGraphQLClient;
		db: typeof db;
		guildIds: string[] | undefined;

		propagate: (type: WebhookType, cb: (feeds: WebhookFeed[]) => Promise<WebhookMessage[]>) => Promise<void>;
	}
}

container.config = config;
container.gql = gql;
container.db = db;
container.guildIds = container.config.get<string | undefined>("client.guilds")?.split(",");

container.propagate = async (type, getMessages) => {
	for (const [guildId] of container.client.guilds.cache) {
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
			const messages = await getMessages(feeds);
			if (messages.length === 0) continue;

			const webhook = await container.client.fetchWebhook(storedWebhook.id, storedWebhook.token);
			const channel = webhook?.channel;
			if (!channel || channel.type !== ChannelType.GuildText) continue;

			const channelMessages = await channel.messages.fetch({ limit: 100 });
			const filteredMessages = messages.filter(
				(message) =>
					!channelMessages.some((channelMessage) =>
						typeof message === "string"
							? channelMessage.content.includes(message)
							: channelMessage.embeds.some(
									(embed) =>
										JSON.stringify({ ...embed.data, color: null }) === JSON.stringify({ ...message, color: null }),
								),
					),
			);

			for (const message of filteredMessages) {
				const options = typeof message === "string" ? message : { embeds: [message] };
				await webhook.send(options);
			}
		}
	}
};

const client = new SapphireClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildScheduledEvents,
	],
	tasks: {
		bull: {
			connection: {
				url: container.config.get("services.redis.uri"),
			},
		},
	},
	logger: {
		level: config.runtimeEnvironment === "production" ? LogLevel.Info : LogLevel.Debug,
	},
});

client.login(container.config.get("client.memberberries.token"));
