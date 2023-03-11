import { StringUtil } from '@luferro/shared-utils';
import mongoose, { Model } from 'mongoose';

import type { Subscription, SubscriptionCatalogEntry,SubscriptionMatches } from '../../types/schemas';

interface SubscriptionsModel extends Model<Subscription> {
	getCatalogByCategory: (category: string) => Promise<Subscription>;
	getCatalogMatches: (title: string) => Promise<SubscriptionMatches[]>;
	updateCatalog: (category: string, catalog: SubscriptionCatalogEntry[]) => Promise<void>;
}

const schema = new mongoose.Schema<Subscription>(
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

schema.statics.getCatalogByCategory = async function (category: string) {
	return this.findOne({ name: category });
};

schema.statics.getCatalogMatches = async function (title: string) {
	const results = await this.aggregate([
		{ $unwind: { path: '$catalog' } },
		{ $match: { 'catalog.slug': { $regex: new RegExp(`${StringUtil.slug(title).replace(/-/g, '(.*?)')}`) } } },
		{ $group: { _id: '$name', entry: { $last: '$catalog' } } },
	]);

	return results
		.sort((a, b) => a._id.localeCompare(b._id))
		.map(({ _id, entry: { name, url } }) => ({ name: _id, entry: { name, url } }));
};

schema.statics.updateCatalog = async function (category: string, catalog: SubscriptionCatalogEntry[]) {
	await this.updateOne({ name: category }, { $set: { catalog, count: catalog.length } }, { upsert: true });
};

export default mongoose.model<Subscription, SubscriptionsModel>('subscriptions', schema);
