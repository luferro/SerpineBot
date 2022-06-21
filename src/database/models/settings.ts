import mongoose, { Model } from 'mongoose';
import { Settings } from '../../types/schemas';

const schema = new mongoose.Schema<Settings>({
	guildId: { type: String, required: true },
	roles: {
		channelId: { type: String, required: true },
		options: [{ type: String, required: true }],
	},
	birthdays: {
		channelId: { type: String, required: true },
	},
	leaderboards: {
		steam: {
			channelId: { type: String, required: true },
		},
	},
	webhooks: [
		{
			id: { type: String, required: true },
			token: { type: String, required: true },
			name: { type: String, required: true },
		},
	],
});

export const settingsModel: Model<Settings> = mongoose.model('settings', schema);
