import { HashUtil } from '@luferro/shared-utils';
import mongoose, { Model } from 'mongoose';

type State = { hash: string };
type Entry = { title: string; url: string };

interface StateModel extends Model<State> {
	createEntry: (entry: Entry) => Promise<boolean>;
}

const schema = new mongoose.Schema<State>(
	{ hash: { type: String, required: true, index: true } },
	{ timestamps: true },
);

schema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

schema.statics.createEntry = async function (entry: Entry) {
	const title = HashUtil.createHash(entry.title);
	const url = HashUtil.createHash(entry.url);

	const exists = await this.exists({ hash: { $regex: `(${title}|${url})` } });
	if (exists) return false;

	await this.create({ hash: `${title};${url}` });
	return true;
};

export default mongoose.model<State, StateModel>('state', schema, 'state');
