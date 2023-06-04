import mongoose, { Model } from 'mongoose';

import type { State, StateEntry } from '../../types/schemas';

interface StateModel extends Model<State> {
	createOrUpdateState: (job: string, entries: StateEntry[]) => Promise<void>;
	getStateByJob: (job: string) => Promise<State | null>;
}

const schema = new mongoose.Schema<State>(
	{
		job: { type: String, required: true },
		entries: [{ title: String, url: String }],
	},
	{ timestamps: true },
);

schema.statics.createOrUpdateState = async function (job: string, entries: StateEntry[]) {
	await this.updateOne({ job }, { $set: { entries: entries.slice(-100) } }, { upsert: true });
};

schema.statics.getStateByJob = async function (job: string) {
	const state = await this.findOne({ job });
	return state ?? null;
};

export default mongoose.model<State, StateModel>('state', schema, 'state');
