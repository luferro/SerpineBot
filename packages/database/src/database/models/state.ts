import mongoose, { Model } from 'mongoose';

type State = { hash: string };

interface StateModel extends Model<State> {
	createEntry: (args: State) => Promise<boolean>;
}

const schema = new mongoose.Schema<State>(
	{ hash: { type: String, required: true, index: true } },
	{ timestamps: true },
);

schema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

schema.statics.createEntry = async function ({ hash }: State) {
	const exists = await this.exists({ hash });
	if (exists) return false;

	await this.create({ hash });
	return true;
};

export default mongoose.model<State, StateModel>('state', schema, 'state');
