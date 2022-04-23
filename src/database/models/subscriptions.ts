import mongoose from 'mongoose';
import { Subscriptions } from '../../types/schemas';

const schema = new mongoose.Schema<Subscriptions>(
	{
		name: { type: String, required: true },
		items: [
			{
				name: { type: String, required: true },
				slug: { type: String, required: true },
				url: { type: String, required: true },
			},
		],
		count: { type: Number, required: true },
	},
	{ timestamps: true },
);

export const subscriptionsModel = mongoose.model('subscriptions', schema);
