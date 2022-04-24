import { TextChannel } from 'discord.js';
import { Bot } from '../bot';
import { settingsModel } from '../database/models/settings';
import { WebhookCategories } from '../types/categories';

export const create = async (guildId: string, channel: TextChannel, webhookName: WebhookCategories) => {
	if (webhookName === 'NSFW' && !channel.nsfw)
		throw new Error('NSFW webhook can only be assigned to a NSFW text channel.');

	const settings = await settingsModel.findOne({ guildId });
	const webhooks = settings?.webhooks ?? [];

	const hasWebhook = webhooks.some(({ name }) => name === webhookName);
	if (hasWebhook) throw new Error('Webhook has already been assigned to a text channel in this guild.');

	const { id, token, name } = await channel.createWebhook(webhookName);
	webhooks.push({ id, token: token!, name });

	await settingsModel.updateOne({ guildId }, { $set: { webhooks } }, { upsert: true });
};

export const getWebhook = async (client: Bot, guildId: string, webhookName: WebhookCategories) => {
	const guild = await client.guilds.fetch(guildId);
	const settings = await settingsModel.findOne({ guildId });

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

export const remove = async (client: Bot, guildId: string, webhookName: WebhookCategories) => {
	const settings = await settingsModel.findOne({ guildId });
	const webhooks = settings?.webhooks ?? [];

	const hasWebhook = webhooks.some(({ name }) => name === webhookName);
	if (!hasWebhook) throw new Error('Webhook is not assigned to a text channel in this guild.');

	const webhook = await getWebhook(client, guildId, webhookName);
	if (!webhook) return;

	await webhook.delete();

	const webhookIndex = webhooks.findIndex(({ name }) => name === webhookName);
	webhooks.splice(webhookIndex, 1);

	await settingsModel.updateOne({ guildId }, { $set: { webhooks } });
};
