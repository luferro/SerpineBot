import mongoose, { Model, Schema } from 'mongoose';

import { IntegrationCategory } from '../../types/enum';
import type {
	BaseIntegration,
	SteamIntegration,
	SteamRecentlyPlayedEntry,
	SteamWishlistEntry,
	XboxIntegration,
} from '../../types/schemas';

type PartialIntegration = SteamIntegration & XboxIntegration;
type Integration<T> = BaseIntegration & T;

interface IntegrationModel extends Model<Integration<PartialIntegration>> {
	checkIfIntegrationIsInPlace: (userId: string, category: IntegrationCategory) => Promise<void>;
	checkIfIntegrationIsNotInPlace: (userId: string, category: IntegrationCategory) => Promise<void>;
	createOrUpdateIntegration: ((
		userId: string,
		category: IntegrationCategory.Steam,
		integration: SteamIntegration,
	) => Promise<void>) &
		((userId: string, category: IntegrationCategory.Xbox, integration: XboxIntegration) => Promise<void>);
	getIntegrationByUserId: ((
		userId: string,
		category: IntegrationCategory.Steam,
	) => Promise<Integration<SteamIntegration>>) &
		((userId: string, category: IntegrationCategory.Xbox) => Promise<Integration<XboxIntegration>>);
	getIntegrations: ((
		category: IntegrationCategory.Steam,
		notifications?: boolean,
	) => Promise<Integration<SteamIntegration>[]>) &
		((category: IntegrationCategory.Xbox) => Promise<Integration<XboxIntegration>[]>);
	updateWishlist: (userId: string, wishlist: Partial<SteamWishlistEntry>[]) => Promise<void>;
	updateRecentlyPlayed: (userId: string, recentlyPlayed: SteamRecentlyPlayedEntry[]) => Promise<void>;
	updateNotifications: (userId: string, notifications: boolean) => Promise<void>;
	updateGamerscore: (userId: string, gamerscore: number) => Promise<void>;
	resetWeeklyHours: () => Promise<void>;
	deleteIntegrationByUserId: (userId: string, category: IntegrationCategory) => Promise<void>;
}

const schema = new mongoose.Schema<Integration<PartialIntegration>>({
	userId: { type: String, required: true },
	category: { type: Number, enum: IntegrationCategory },
	profile: { type: Schema.Types.Mixed },
	wishlist: { type: Schema.Types.Mixed },
	recentlyPlayed: { type: Schema.Types.Mixed },
	notifications: { type: Schema.Types.Mixed },
});

schema.statics.checkIfIntegrationIsInPlace = async function (userId: string, category: IntegrationCategory) {
	const isInPlace = await this.exists({ userId, category });
	if (!isInPlace) throw new Error(`No ${IntegrationCategory[category]} integration is in place.`);
};

schema.statics.checkIfIntegrationIsNotInPlace = async function (userId: string, category: IntegrationCategory) {
	const isInPlace = await this.exists({ userId, category });
	if (isInPlace) throw new Error(`${IntegrationCategory[category]} integration is already in place.`);
};

schema.statics.createOrUpdateIntegration = async function (
	userId: string,
	category: IntegrationCategory,
	integration: PartialIntegration,
) {
	await this.updateOne({ userId, category }, { $set: integration }, { upsert: true });
};

schema.statics.getIntegrationByUserId = async function (userId: string, category: IntegrationCategory) {
	return await this.findOne({ userId, category });
};

schema.statics.getIntegrations = async function (category: IntegrationCategory, notifications?: boolean) {
	return typeof notifications === 'undefined'
		? await this.find({ category })
		: await this.find({ category, notifications });
};

schema.statics.updateWishlist = async function (userId: string, wishlist: Partial<SteamWishlistEntry>[]) {
	await this.updateOne({ userId, category: IntegrationCategory.Steam }, { $set: { wishlist } });
};

schema.statics.updateRecentlyPlayed = async function (userId: string, recentlyPlayed: SteamRecentlyPlayedEntry[]) {
	await this.updateOne({ userId, category: IntegrationCategory.Steam }, { $set: { recentlyPlayed } });
};

schema.statics.updateNotifications = async function (userId: string, notifications: boolean) {
	await this.updateOne({ userId, category: IntegrationCategory.Steam }, { $set: { notifications } });
};

schema.statics.updateGamerscore = async function (userId: string, gamerscore: number) {
	await this.updateOne(
		{ userId, category: IntegrationCategory.Xbox },
		{ $set: { 'profile.gamerscore': gamerscore } },
	);
};

schema.statics.resetWeeklyHours = async function () {
	await this.updateMany({ category: IntegrationCategory.Steam }, { $set: { 'recentlyPlayed.$[].weeklyHours': 0 } });
};

schema.statics.deleteIntegrationByUserId = async function (userId: string, category: IntegrationCategory) {
	await this.deleteOne({ userId, category });
};

export default mongoose.model<Integration<PartialIntegration>, IntegrationModel>('integrations', schema);
