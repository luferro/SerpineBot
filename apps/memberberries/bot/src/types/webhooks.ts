import type { EmbedBuilder, Guild } from "discord.js";
import type * as schema from "~/db/schema.js";

export type WebhookType = (typeof schema.webhookEnum.enumValues)[number];

export type WebhookFeedOptions = {
	sort: string;
	limit: number;
	flairs: string[];
};

type WebhookFeed = {
	webhookId: string;
	feedId: number;
	path: string;
	options: unknown;
};
type WebhookMessage = EmbedBuilder | string;

export type PropagateCallback = (args: {
	guild: Guild;
	feeds: WebhookFeed[];
}) => Promise<{
	name: string;
	skipCache?: boolean;
	messages: WebhookMessage[];
}>;
