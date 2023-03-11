import { SettingsModel, WebhookCategory } from '@luferro/database';
import type { Client, TextChannel } from 'discord.js';

export const getWebhookName = (category: WebhookCategory) => {
	const webhookNames: Record<typeof category, string> = {
		[WebhookCategory.Nsfw]: 'NSFW',
		[WebhookCategory.Memes]: 'Memes',
		[WebhookCategory.Anime]: 'Anime',
		[WebhookCategory.Manga]: 'Manga',
		[WebhookCategory.WorldNews]: 'World News',
		[WebhookCategory.PortugalNews]: 'Portugal News',
		[WebhookCategory.GamingNews]: 'Gaming News',
		[WebhookCategory.Reviews]: 'Game Reviews',
		[WebhookCategory.Deals]: 'Game Deals',
		[WebhookCategory.FreeGames]: 'Free Games',
		[WebhookCategory.Xbox]: 'Xbox',
		[WebhookCategory.PlayStation]: 'PlayStation',
		[WebhookCategory.Nintendo]: 'Nintendo',
	};
	return webhookNames[category];
};

export const createWebhook = async (guildId: string, channel: TextChannel, category: WebhookCategory) => {
	if (category === WebhookCategory.Nsfw && !channel.nsfw) {
		throw new Error('Nsfw webhook can only be assigned to a nsfw text channel.');
	}

	const settings = await SettingsModel.getSettingsByGuildId(guildId);
	const hasWebhook = (settings?.webhooks ?? []).some((webhook) => webhook.category === category);
	if (hasWebhook) throw new Error('Webhook has already been assigned to a text channel in this guild.');

	const { id, token, name } = await channel.createWebhook({ name: getWebhookName(category) });
	if (!token) throw new Error('No token was provided.');

	await SettingsModel.createGuildWebhook(guildId, { category, id, token, name });
};

export const getWebhook = async (client: Client, guildId: string, category: WebhookCategory) => {
	const guild = await client.guilds.fetch(guildId);
	const settings = await SettingsModel.getSettingsByGuildId(guildId);

	const guildWebhook = settings?.webhooks.find((webhook) => webhook.category === category);
	if (!guildWebhook) return;

	const guildWebhooks = await guild.fetchWebhooks();
	const hasWebhook = guildWebhooks.has(guildWebhook.id);
	if (!hasWebhook) return await SettingsModel.deleteGuildWebhook(guildId, category);

	return await client.fetchWebhook(guildWebhook.id, guildWebhook.token);
};

export const deleteWebhook = async (client: Client, guildId: string, category: WebhookCategory) => {
	const settings = await SettingsModel.getSettingsByGuildId(guildId);
	const hasWebhook = (settings?.webhooks ?? []).some((webhook) => webhook.category === category);
	if (!hasWebhook) throw new Error('Webhook is not assigned to a text channel in this guild.');

	const webhook = await getWebhook(client, guildId, category);
	if (!webhook) return;

	await webhook.delete();
	await SettingsModel.deleteGuildWebhook(guildId, category);
};
