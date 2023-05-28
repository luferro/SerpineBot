import mongoose, { Model } from 'mongoose';

import { Action, Webhook } from '../../types/enum';
import type { BaseSettings, GuildMessage, GuildSettings, GuildWebhook } from '../../types/schemas';

type Settings = BaseSettings & GuildSettings;

interface SettingsModel extends Model<Settings> {
	createGuildSettings: (guildId: string, settings: GuildSettings) => Promise<void>;
	createGuildWebhook: (guildId: string, webhook: GuildWebhook) => Promise<void>;
	createGuildMessage: (guildId: string, message: GuildMessage) => Promise<void>;
	getSettingsByGuildId: (guildId: string) => Promise<Settings | null>;
	getGuildWebhook: (guildId: string, category: Webhook) => Promise<GuildWebhook | null>;
	getGuildMessage: (guildId: string, category: Action) => Promise<GuildMessage | null>;
	deleteSettingsByGuildId: (guildId: string) => Promise<void>;
	deleteGuildWebhook: (guildId: string, category: Webhook) => Promise<void>;
	deleteGuildMessage: (guildId: string, category: Action) => Promise<void>;
}

const schema = new mongoose.Schema<Settings>({
	guildId: { type: String, required: true },
	messages: [
		{
			category: { type: Number, enum: Action, required: true },
			channelId: { type: String, required: true },
			options: [{ type: String, required: true }],
		},
	],
	webhooks: [
		{
			category: { type: Number, enum: Webhook, required: true },
			id: { type: String, required: true },
			token: { type: String, required: true },
			name: { type: String, required: true },
		},
	],
});

schema.statics.createGuildSettings = async function (guildId: string, settings: GuildSettings) {
	await this.create({ guildId, ...settings });
};

schema.statics.createGuildWebhook = async function (guildId: string, webhook: Webhook) {
	await this.updateOne({ guildId }, { $push: { webhooks: webhook } });
};

schema.statics.createGuildMessage = async function (guildId: string, message: Action) {
	await this.updateOne({ guildId }, { $push: { messages: message } });
};

schema.statics.getSettingsByGuildId = async function (guildId: string) {
	const settings = await this.findOne({ guildId });
	return settings ?? null;
};

schema.statics.getGuildWebhook = async function (guildId: string, category: Webhook) {
	const results = await this.findOne({ guildId, 'webhooks.category': category }, { 'webhooks.$': 1 });
	return results?.webhooks[0] ?? null;
};

schema.statics.getGuildMessage = async function (guildId: string, category: Action) {
	const results = await this.findOne({ guildId, 'messages.category': category }, { 'messages.$': 1 });
	return results?.messages[0] ?? null;
};

schema.statics.deleteSettingsByGuildId = async function (guildId: string) {
	await this.deleteOne({ guildId });
};

schema.statics.deleteGuildWebhook = async function (guildId: string, category: Webhook) {
	await this.updateOne({ guildId }, { $pull: { webhooks: { category } } });
};

schema.statics.deleteGuildMessage = async function (guildId: string, category: Action) {
	await this.updateOne({ guildId }, { $pull: { messages: { category } } });
};

export default mongoose.model<Settings, SettingsModel>('settings', schema);
