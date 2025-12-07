import { createHash } from "@luferro/cache";
import { container } from "@sapphire/pieces";
import { EmbedBuilder } from "discord.js";
import type { TextBasedChannel } from "discord.js";
import type { WebhookMessage, WebhookType } from "~/types/webhooks.js";

const urlRegex = /https?:\/\/[^\s'"<>]+/g;

export function isEmbed(message: WebhookMessage) {
	return message instanceof EmbedBuilder;
}

export function isContent(message: WebhookMessage) {
	return typeof message === "string";
}

function extractFieldsFromContent(message: string) {
	return {
		title: message.replaceAll(urlRegex, "").trim(),
		url: message.match(urlRegex)?.at(-1),
	};
}

function getContentsToHash(message: WebhookMessage) {
	const contentsToHash = isEmbed(message)
		? [JSON.stringify({ ...message.data, color: null }), message.data.title, message.data.url]
		: [message.replaceAll(urlRegex, "<url>"), message.match(urlRegex)?.at(-1)];
	return contentsToHash.filter((content): content is NonNullable<string> => Boolean(content));
}

type DuplicateOptions = {
	type: WebhookType;
	channel: TextBasedChannel;
	message: WebhookMessage;
	skipCache?: boolean;
};

async function isInCache({ type, channel, message }: Omit<DuplicateOptions, "skipCache">) {
	let isDuplicate = true;
	for (const contentToHash of getContentsToHash(message)) {
		const key = `message:${type}:${channel.id}:${createHash(contentToHash)}`;
		const inCache = await container.cache.checkAndMarkSent(key);
		if (!inCache) isDuplicate = false;
	}

	return { messageId: null, isDuplicate };
}

async function isInChannel({ channel, message }: Omit<DuplicateOptions, "type" | "skipCache">) {
	const channelMessages = await channel.messages.fetch({ limit: 100 });
	const existingMessage = channelMessages.find((channelMessage) => {
		if (isEmbed(message) && channelMessage.embeds.length > 0) {
			const embedTitle = channelMessage.embeds[0].title;
			const embedUrl = channelMessage.embeds[0].url;
			return message.data.title === embedTitle || message.data.url === embedUrl;
		}

		if (isContent(message) && channelMessage.content.length > 0) {
			const messageFields = extractFieldsFromContent(message);
			const contentFields = extractFieldsFromContent(channelMessage.content);
			return messageFields.title === contentFields.title || messageFields.url === contentFields.url;
		}

		return false;
	});

	return existingMessage
		? { messageId: existingMessage.id, isDuplicate: true }
		: { messageId: null, isDuplicate: false };
}

export async function isDuplicate({ type, channel, message, skipCache = false }: DuplicateOptions) {
	if (skipCache) return { messageId: null, isDuplicate: false };

	const inCacheResult = await isInCache({ type, channel, message });
	if (inCacheResult.isDuplicate) return inCacheResult;

	return await isInChannel({ channel, message });
}
