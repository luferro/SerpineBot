import mongoose, { Model } from 'mongoose';

import type { State, StateEntry } from '../../types/schemas';

interface StateModel extends Model<State> {
	createOrUpdateState: (jobName: string, category: string, entries: StateEntry[]) => Promise<void>;
	getStateByJobName: (jobName: string) => Promise<State>;
}

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

schema.statics.createOrUpdateState = async function (jobName: string, category: string, entries: StateEntry[]) {
	await this.updateOne(
		{ jobName: jobName.toUpperCase() },
		{ $set: { [`entries.${category}`]: entries.slice(-100) } },
		{ upsert: true },
	);
};

schema.statics.getStateByJobName = async function (jobName: string) {
	await this.findOne({ jobName: jobName.toUpperCase() });
};

export default mongoose.model<State, StateModel>('state', schema, 'state');
