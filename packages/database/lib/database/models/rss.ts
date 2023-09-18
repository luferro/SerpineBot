import mongoose, { Model } from 'mongoose';

type RSS = { key: string; feeds: string[] };

interface RssModel extends Model<RSS> {
	getFeeds: (args: Pick<RSS, 'key'>) => Promise<string[]>;
}

const schema = new mongoose.Schema<RSS>({
	key: { type: String, required: true },
	feeds: [{ type: String, required: true }],
});

schema.statics.getFeeds = async function ({ key }: Pick<RSS, 'key'>) {
	const data = await this.findOne({ key });
	return data?.feeds ?? [];
};

export default mongoose.model<RSS, RssModel>('rss', schema, 'rss');
