import mongoose, { Model } from 'mongoose';
import type { Subscriptions } from '../../types/schemas';

const schema = new mongoose.Schema<Subscriptions>(
	{
		name: { type: String, required: true },
		catalog: [
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

export const subscriptionsModel: Model<Subscriptions> = mongoose.model('subscriptions', schema);
