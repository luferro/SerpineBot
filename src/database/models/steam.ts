import mongoose, { Model } from 'mongoose';
import { Steam } from '../../types/schemas';

const schema = new mongoose.Schema<Steam>({
	userId: { type: String, required: true },
	profile: {
		id: { type: String, required: true },
		url: { type: String, required: true },
	},
	wishlist: [
		{
			id: { type: String, required: true },
			name: { type: String, required: true },
			url: { type: String, required: true },
			priority: { type: Number, required: true },
			discount: { type: Number, required: true },
			regular: { type: String, required: true },
			discounted: { type: String, required: true },
			free: { type: Boolean, required: true },
			released: { type: Boolean, required: true },
			sale: { type: Boolean, required: true },
			subscriptions: {
				xbox_game_pass: { type: Boolean, required: true },
				pc_game_pass: { type: Boolean, required: true },
				ubisoft_plus: { type: Boolean, required: true },
				ea_play_pro: { type: Boolean, required: true },
				ea_play: { type: Boolean, required: true },
			},
			notified: { type: Boolean, required: true },
		},
	],
	recentlyPlayed: [
		{
			id: { type: Number, required: true },
			name: { type: String, required: true },
			url: { type: String, required: true },
			weeklyHours: { type: Number, required: true },
			totalHours: { type: Number, required: true },
		},
	],
	notifications: { type: Boolean, required: true },
});

export const steamModel: Model<Steam> = mongoose.model('steam', schema, 'steam');
