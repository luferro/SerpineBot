import { SettingsModel, WebhookEnum } from '@luferro/database';
import type { Client, TextChannel } from 'discord.js';

export const getWebhookName = (category: WebhookEnum) => {
	const webhookNames: Record<typeof category, string> = {
		[WebhookEnum.Nsfw]: 'NSFW',
		[WebhookEnum.Memes]: 'Memes',
		[WebhookEnum.Anime]: 'Anime',
		[WebhookEnum.Manga]: 'Manga',
		[WebhookEnum.WorldNews]: 'World News',
		[WebhookEnum.PortugalNews]: 'Portugal News',
		[WebhookEnum.GamingNews]: 'Gaming News',
		[WebhookEnum.Reviews]: 'Game Reviews',
		[WebhookEnum.Deals]: 'Game Deals',
		[WebhookEnum.FreeGames]: 'Free Games',
		[WebhookEnum.Xbox]: 'Xbox',
		[WebhookEnum.PlayStation]: 'PlayStation',
		[WebhookEnum.Nintendo]: 'Nintendo',
	};
	return webhookNames[category];
};

export const createWebhook = async (guildId: string, channel: TextChannel, category: WebhookEnum) => {
	if (category === WebhookEnum.Nsfw && !channel.nsfw) {
		throw new Error('Nsfw webhook can only be assigned to a nsfw text channel.');
	}

	const webhook = await SettingsModel.getGuildWebhook(guildId, category);
	if (webhook) throw new Error('Webhook has already been assigned to a text channel in this guild.');

	const { id, token, name } = await channel.createWebhook({ name: getWebhookName(category) });
	if (!token) throw new Error('No token was provided.');

	await SettingsModel.createGuildWebhook(guildId, { category, id, token, name });
};

export const getWebhook = async (client: Client, guildId: string, category: WebhookEnum) => {
	const webhook = await SettingsModel.getGuildWebhook(guildId, category);
	if (!webhook) return null;

	const guild = await client.guilds.fetch(guildId);
	const guildWebhooks = await guild.fetchWebhooks();
	const hasWebhook = guildWebhooks.has(webhook.id);
	if (!hasWebhook) {
		await SettingsModel.deleteGuildWebhook(guildId, category);
		return null;
	}

	return await client.fetchWebhook(webhook.id, webhook.token);
};

export const deleteWebhook = async (client: Client, guildId: string, category: WebhookEnum) => {
	const webhook = await SettingsModel.getGuildWebhook(guildId, category);
	if (!webhook) throw new Error('Webhook is not assigned to a text channel in this guild.');

	const guildWebhook = await getWebhook(client, guildId, category);
	if (!guildWebhook) return;

	await guildWebhook.delete();
	await SettingsModel.deleteGuildWebhook(guildId, category);
};
