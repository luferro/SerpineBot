import { StringUtil } from '@luferro/shared-utils';
import mongoose, { Model } from 'mongoose';

import { SubscriptionType } from '../../types/category';

type CatalogEntry = { name: string; slug: string; url: string | null };
type Match = { provider: string; entry: CatalogEntry };
type Subscription = { name: string; count: number; catalog: CatalogEntry[] };

type Category = { category: SubscriptionType };
type Catalog = { catalog: CatalogEntry[] };

interface SubscriptionsModel extends Model<Subscription> {
	updateCatalog: (args: Category & Catalog) => Promise<void>;
	getCatalog: (args: Category) => Promise<Subscription>;
	getMatches: (args: Pick<CatalogEntry, 'name'>) => Promise<Match[]>;
}

const schema = new mongoose.Schema<Subscription>(
	{
		name: { type: String, required: true, index: true },
		count: { type: Number, required: true },
		catalog: [
			{
				name: { type: String, required: true },
				slug: { type: String, required: true },
				url: { type: String, required: true },
			},
		],
	},
	{ timestamps: true },
);

schema.statics.updateCatalog = async function ({ category, catalog }: Category & Catalog) {
	await this.updateOne({ name: category }, { $set: { catalog, count: catalog.length } }, { upsert: true });
};

schema.statics.getCatalog = async function ({ category }: Category) {
	return this.findOne({ name: category });
};

schema.statics.getMatches = async function ({ name }: Pick<CatalogEntry, 'name'>) {
	const results = await this.aggregate([
		{ $unwind: { path: '$catalog' } },
		{ $match: { 'catalog.slug': { $regex: new RegExp(`${StringUtil.slug(name).replace(/-/g, '(.*?)')}`) } } },
		{ $group: { _id: '$name', entry: { $last: '$catalog' } } },
	]);

	return results
		.sort((a, b) => a._id.localeCompare(b._id))
		.map(({ _id, entry }) => ({ provider: _id, entry: { name: entry.name, url: entry.url } }));
};

export default mongoose.model<Subscription, SubscriptionsModel>('subscriptions', schema);
