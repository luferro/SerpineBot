import type { EmbedBuilder } from "discord.js";
import type * as schema from "~/db/schema.js";

export type WebhookType = (typeof schema.webhookEnum.enumValues)[number];
export type WebhookFeed = typeof schema.feeds.$inferSelect;
export type WebhookMessage = EmbedBuilder | string;
export type WebhookFeedOptions = {
	sort: string;
	limit: number;
	flairs: string[];
};
