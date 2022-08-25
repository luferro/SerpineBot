import { TextChannel } from 'discord.js';
import { Bot } from '../bot';
import { settingsModel } from '../database/models/settings';
import { WebhookCategory } from '../types/enums';

export const getWebhookNameFromCategory = (category: WebhookCategory) => {
	const webhookNames = {
		[WebhookCategory.Nsfw]: 'NSFW',
		[WebhookCategory.Memes]: 'Memes',
		[WebhookCategory.Anime]: 'Anime',
		[WebhookCategory.Manga]: 'Manga',
		[WebhookCategory.WorldNews]: 'World News',
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

export const create = async (guildId: string, channel: TextChannel, category: WebhookCategory) => {
	if (category === WebhookCategory.Nsfw && !channel.nsfw)
		throw new Error('NSFW webhook can only be assigned to a NSFW text channel.');

	const settings = await settingsModel.findOne({ guildId });
	const webhooks = settings?.webhooks ?? [];

	const webhookName = getWebhookNameFromCategory(category);
	const hasWebhook = webhooks.some(({ name }) => name === webhookName);
	if (hasWebhook) throw new Error('Webhook has already been assigned to a text channel in this guild.');

	const { id, token, name } = await channel.createWebhook({ name: webhookName });
	if (!token) throw new Error('No token was provided.');

	webhooks.push({ id, token, name });

	await settingsModel.updateOne({ guildId }, { $set: { webhooks } }, { upsert: true });
};

export const getWebhook = async (client: Bot, guildId: string, category: WebhookCategory) => {
	const guild = await client.guilds.fetch(guildId);
	const settings = await settingsModel.findOne({ guildId });

	const webhookName = getWebhookNameFromCategory(category);
	const webhooks = settings?.webhooks ?? [];
	const guildWebhooks = await guild.fetchWebhooks();

	const guildWebhook = webhooks.find(({ name }) => name === webhookName);
	if (!guildWebhook) return;

	const hasWebhook = guildWebhooks.has(guildWebhook.id);
	if (!hasWebhook) {
		const webhookIndex = webhooks.findIndex(({ name }) => name === webhookName);
		webhooks.splice(webhookIndex, 1);

		await settingsModel.updateOne({ guild: guild.id }, { $set: { webhooks } });
		return;
	}

	return await client.fetchWebhook(guildWebhook.id, guildWebhook.token);
};

export const remove = async (client: Bot, guildId: string, category: WebhookCategory) => {
	const settings = await settingsModel.findOne({ guildId });
	const webhooks = settings?.webhooks ?? [];

	const webhookName = getWebhookNameFromCategory(category);
	const hasWebhook = webhooks.some(({ name }) => name === webhookName);
	if (!hasWebhook) throw new Error('Webhook is not assigned to a text channel in this guild.');

	const webhook = await getWebhook(client, guildId, category);
	if (!webhook) return;

	await webhook.delete();

	const webhookIndex = webhooks.findIndex(({ name }) => name === webhookName);
	webhooks.splice(webhookIndex, 1);

	await settingsModel.updateOne({ guildId }, { $set: { webhooks } });
};
