import mongoose, { Model, Schema } from 'mongoose';

import { IntegrationType } from '../../types/category';
import { RecentlyPlayedEntry, SteamIntegration, WishlistEntry, XboxIntegration } from '../../types/integration';

type PartialType = SteamIntegration | XboxIntegration;
type BaseIntegration = { userId: string; category: IntegrationType };
type PartialIntegration<T> = { partialIntegration: T };
type Integration<T> = BaseIntegration & T;

type UserId = Pick<BaseIntegration, 'userId'>;
type Category = Pick<BaseIntegration, 'category'>;
type Notifications = { notifications?: boolean };
type Wishlist = { wishlist: Partial<WishlistEntry>[] };
type RecentlyPlayed = { recentlyPlayed: RecentlyPlayedEntry[] };
type Gamerscore = { gamerscore: number };

interface IntegrationModel extends Model<Integration<PartialType>> {
	createIntegration: <T extends PartialType>(args: BaseIntegration & PartialIntegration<T>) => Promise<void>;
	updateIntegration: <T extends PartialType>(args: BaseIntegration & PartialIntegration<T>) => Promise<void>;
	getIntegration: <T extends PartialType>(args: BaseIntegration) => Promise<Integration<T>>;
	getIntegrations: <T extends PartialType>(args: Category & Notifications) => Promise<Integration<T>[]>;
	updateWishlist: (args: UserId & Wishlist) => Promise<void>;
	updateRecentlyPlayed: (args: UserId & RecentlyPlayed) => Promise<void>;
	updateNotifications: (args: UserId & Notifications) => Promise<void>;
	updateGamerscore: (args: UserId & Gamerscore) => Promise<void>;
	resetWeeklyHours: () => Promise<void>;
	deleteIntegrationByUserId: (args: BaseIntegration) => Promise<void>;
}

const schema = new mongoose.Schema<Integration<PartialType>>({
	userId: { type: String, required: true, index: true },
	category: { type: String, required: true, index: true },
	profile: { type: Schema.Types.Mixed },
	wishlist: { type: Schema.Types.Mixed },
	recentlyPlayed: { type: Schema.Types.Mixed },
	notifications: { type: Schema.Types.Mixed },
});

schema.statics.createIntegration = async function ({
	userId,
	category,
	partialIntegration,
}: BaseIntegration & PartialIntegration<PartialType>) {
	const exists = await this.exists({ userId, category });
	if (exists) throw new Error(`${category} integration is already in place`);
	await this.create({ userId, category, ...partialIntegration });
};

schema.statics.updateIntegration = async function ({
	userId,
	category,
	partialIntegration,
}: BaseIntegration & PartialIntegration<PartialType>) {
	const exists = await this.exists({ userId, category });
	if (!exists) throw new Error(`No ${category} integration is in place`);
	await this.updateOne({ userId, category }, { $set: partialIntegration });
};

schema.statics.getIntegration = async function ({ userId, category }: BaseIntegration) {
	return await this.findOne({ userId, category });
};

schema.statics.getIntegrations = async function ({ category, notifications }: Category & Notifications) {
	return typeof notifications === 'undefined'
		? await this.find({ category })
		: await this.find({ category, notifications });
};

schema.statics.updateWishlist = async function ({ userId, wishlist }: UserId & Wishlist) {
	await this.updateOne({ userId, category: 'Steam' }, { $set: { wishlist } });
};

schema.statics.updateRecentlyPlayed = async function ({ userId, recentlyPlayed }: UserId & RecentlyPlayed) {
	await this.updateOne({ userId, category: 'Steam' }, { $set: { recentlyPlayed } });
};

schema.statics.updateNotifications = async function ({ userId, notifications }: UserId & Notifications) {
	await this.updateOne({ userId, category: 'Steam' }, { $set: { notifications: Boolean(notifications) } });
};

schema.statics.updateGamerscore = async function ({ userId, gamerscore }: UserId & Gamerscore) {
	await this.updateOne({ userId, category: 'Xbox' }, { $set: { 'profile.gamerscore': gamerscore } });
};

schema.statics.resetWeeklyHours = async function () {
	await this.updateMany({ category: 'Steam' }, { $set: { 'recentlyPlayed.$[].weeklyHours': 0 } });
};

schema.statics.deleteIntegrationByUserId = async function ({ userId, category }: BaseIntegration) {
	await this.deleteOne({ userId, category });
};

export default mongoose.model<Integration<PartialType>, IntegrationModel>('integrations', schema);
