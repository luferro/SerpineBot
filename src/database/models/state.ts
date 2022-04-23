import mongoose from 'mongoose';
import { State } from '../../types/schemas';

const schema = new mongoose.Schema<State>(
	{
		category: { type: String, required: true },
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

export const stateModel = mongoose.model('state', schema, 'state');
