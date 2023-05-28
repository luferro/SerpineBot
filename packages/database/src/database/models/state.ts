import mongoose, { Model } from 'mongoose';

import type { State, StateEntry } from '../../types/schemas';

interface StateModel extends Model<State> {
	createOrUpdateState: (job: string, category: string, entries: StateEntry[]) => Promise<void>;
	getStateByJob: (job: string) => Promise<State | null>;
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

schema.statics.createOrUpdateState = async function (job: string, category: string, entries: StateEntry[]) {
	await this.updateOne(
		{ jobName: job.toUpperCase() },
		{ $set: { [`entries.${category}`]: entries.slice(-100) } },
		{ upsert: true },
	);
};

schema.statics.getStateByJob = async function (job: string) {
	const state = await this.findOne({ jobName: job.toUpperCase() });
	return state ?? null;
};

export default mongoose.model<State, StateModel>('state', schema, 'state');
