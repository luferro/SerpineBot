import { StringUtil } from '@luferro/shared-utils';
import mongoose, { Model } from 'mongoose';

type Entry = { name: string; slug: string; url: string | null };
type Provider = { provider: string; entry: Entry };
type Subscription = { catalog: string; count: number; entries: Entry[] };

type Catalog = { catalog: string };
type Entries = { entries: Entry[] };

interface SubscriptionsModel extends Model<Subscription> {
	updateCatalog: (args: Catalog & Entries) => Promise<void>;
	getCatalog: (args: Catalog) => Promise<Subscription>;
	getGamingServices: (args: Pick<Entry, 'name'>) => Promise<Provider[]>;
}

const schema = new mongoose.Schema<Subscription>(
	{
		catalog: { type: String, required: true, index: true },
		count: { type: Number, required: true },
		entries: [
			{
				name: { type: String, required: true },
				slug: { type: String, required: true },
				url: { type: String, required: true },
			},
		],
	},
	{ timestamps: true },
);

schema.statics.updateCatalog = async function ({ catalog, entries }: Catalog & Entries) {
	await this.updateOne({ catalog }, { $set: { entries, count: entries.length } }, { upsert: true });
};

schema.statics.getCatalog = async function ({ catalog }: Catalog) {
	return this.findOne({ catalog });
};

schema.statics.getGamingServices = async function ({ name }: Pick<Entry, 'name'>) {
	const results = await this.aggregate([
		{ $unwind: { path: '$entries' } },
		{ $match: { 'entries.slug': { $regex: new RegExp(`${StringUtil.slug(name).replace(/-/g, '(.*?)')}`) } } },
		{ $group: { _id: '$name', entry: { $last: '$entries' } } },
	]);

	return results
		.sort((a, b) => a._id.localeCompare(b._id))
		.map(({ _id, entry }) => ({ provider: _id, entry: { name: entry.name, url: entry.url } }));
};

export default mongoose.model<Subscription, SubscriptionsModel>('subscriptions', schema);
