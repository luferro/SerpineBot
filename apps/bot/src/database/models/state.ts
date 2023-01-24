import mongoose, { Model } from 'mongoose';
import type { State } from '../../types/schemas';

const schema = new mongoose.Schema<State>(
	{
		jobName: { type: String, required: true },
		entries: {
			type: Map,
			of: [
				{
					title: String,
					url: String,
				},
			],
		},
	},
	{ timestamps: true },
);

export const stateModel: Model<State> = mongoose.model('state', schema, 'state');
