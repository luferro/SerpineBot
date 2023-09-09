import mongoose, { Model } from 'mongoose';

import { WebhookType } from '../../types/category';

type Webhook = { category: WebhookType; id: string; token: string };
type RoleConfig = { channelId: string | null; options: string[] };
type WebhookConfig = { webhook: Webhook };
type Settings = { guildId: string; roles: RoleConfig; webhooks: Map<WebhookType, Webhook> };

export const webhooks: WebhookType[] = [
	'Anime',
	'Birthdays',
	'Events',
	'Free Games',
	'Game Deals',
	'Game Reviews',
	'Gaming News',
	'Leaderboards',
	'Manga',
	'Memes',
	'Nintendo',
	'Nsfw',
	'PlayStation',
	'Portugal News',
	'World News',
	'Xbox',
];

interface SettingsModel extends Model<Settings> {
	createSettings: (args: Settings) => Promise<void>;
	getSettingsByGuildId: (args: Pick<Settings, 'guildId'>) => Promise<Omit<Settings, 'guildId'> | null>;
	deleteSettingsByGuildId: (args: Pick<Settings, 'guildId'>) => Promise<void>;
	updateRoleMessage: (args: Pick<Settings, 'guildId'> & RoleConfig) => Promise<void>;
	addWebhook: (args: Pick<Settings, 'guildId'> & WebhookConfig) => Promise<void>;
	removeWebhook: (args: Pick<Settings, 'guildId'> & Pick<Webhook, 'category'>) => Promise<void>;
}

const schema = new mongoose.Schema<Settings>({
	guildId: { type: String, required: true, index: true },
	roles: {
		channelId: { type: String },
		options: [{ type: String }],
	},
	webhooks: {
		type: Map,
		of: new mongoose.Schema({
			id: { type: String, required: true },
			token: { type: String, required: true },
		}),
	},
});

schema.statics.createSettings = async function ({ guildId, roles, webhooks }: Settings) {
	await this.create({ guildId, roles, webhooks });
};

schema.statics.getSettingsByGuildId = async function ({ guildId }: Pick<Settings, 'guildId'>) {
	const settings = await this.findOne({ guildId });
	return settings ?? null;
};

schema.statics.deleteSettingsByGuildId = async function ({ guildId }: Pick<Settings, 'guildId'>) {
	await this.deleteOne({ guildId });
};

schema.statics.updateRoleMessage = async function ({
	guildId,
	channelId,
	options,
}: Pick<Settings, 'guildId'> & RoleConfig) {
	await this.updateOne({ guildId }, { $set: { roles: { channelId, options } } });
};

schema.statics.addWebhook = async function ({ guildId, webhook }: Pick<Settings, 'guildId'> & { webhook: Webhook }) {
	await this.updateOne(
		{ guildId },
		{ $set: { [`webhooks.${webhook.category}`]: { id: webhook.id, token: webhook.token } } },
	);
};

schema.statics.removeWebhook = async function ({
	guildId,
	category,
}: Pick<Settings, 'guildId'> & Pick<Webhook, 'category'>) {
	await this.updateOne({ guildId }, { $unset: { [`webhooks.${category}`]: 1 } });
};

export default mongoose.model<Settings, SettingsModel>('settings', schema);
