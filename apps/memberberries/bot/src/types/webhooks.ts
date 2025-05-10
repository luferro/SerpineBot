import type { EmbedBuilder } from "discord.js";
import type * as schema from "~/db/schema.js";

export type WebhookType = (typeof schema.webhookEnum.enumValues)[number];
export type WebhookFeedOptions = {
	sort: string;
	limit: number;
	flairs: string[];
};
export type WebhookFeed = {
	webhookId: string;
	feedId: number;
	path: string;
	options: unknown;
};
export type WebhookMessage = EmbedBuilder | string;
