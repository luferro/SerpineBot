import mongoose, { Model, Schema } from 'mongoose';

import { Integration } from '../../types/enum';
import type {
	BaseIntegration,
	SteamIntegration,
	SteamRecentlyPlayedEntry,
	SteamWishlistEntry,
	XboxIntegration,
} from '../../types/schemas';

type PartialIntegration = SteamIntegration & XboxIntegration;
type FullIntegration<T> = BaseIntegration & T;

interface IntegrationModel extends Model<FullIntegration<PartialIntegration>> {
	checkIfIntegrationIsInPlace: (userId: string, category: Integration) => Promise<void>;
	checkIfIntegrationIsNotInPlace: (userId: string, category: Integration) => Promise<void>;
	createOrUpdateIntegration: ((
		userId: string,
		category: Integration.Steam,
		integration: SteamIntegration,
	) => Promise<void>) &
		((userId: string, category: Integration.Xbox, integration: XboxIntegration) => Promise<void>);
	getIntegrationByUserId: ((
		userId: string,
		category: Integration.Steam,
	) => Promise<FullIntegration<SteamIntegration>>) &
		((userId: string, category: Integration.Xbox) => Promise<FullIntegration<XboxIntegration>>);
	getIntegrations: ((
		category: Integration.Steam,
		notifications?: boolean,
	) => Promise<FullIntegration<SteamIntegration>[]>) &
		((category: Integration.Xbox) => Promise<FullIntegration<XboxIntegration>[]>);
	updateWishlist: (userId: string, wishlist: Partial<SteamWishlistEntry>[]) => Promise<void>;
	updateRecentlyPlayed: (userId: string, recentlyPlayed: SteamRecentlyPlayedEntry[]) => Promise<void>;
	updateNotifications: (userId: string, notifications: boolean) => Promise<void>;
	updateGamerscore: (userId: string, gamerscore: number) => Promise<void>;
	resetWeeklyHours: () => Promise<void>;
	deleteIntegrationByUserId: (userId: string, category: Integration) => Promise<void>;
}

const schema = new mongoose.Schema<FullIntegration<PartialIntegration>>({
	userId: { type: String, required: true },
	category: { type: Number, enum: Integration },
	profile: { type: Schema.Types.Mixed },
	wishlist: { type: Schema.Types.Mixed },
	recentlyPlayed: { type: Schema.Types.Mixed },
	notifications: { type: Schema.Types.Mixed },
});

schema.statics.checkIfIntegrationIsInPlace = async function (userId: string, category: Integration) {
	const isInPlace = await this.exists({ userId, category });
	if (!isInPlace) throw new Error(`No ${Integration[category]} integration is in place.`);
};

schema.statics.checkIfIntegrationIsNotInPlace = async function (userId: string, category: Integration) {
	const isInPlace = await this.exists({ userId, category });
	if (isInPlace) throw new Error(`${Integration[category]} integration is already in place.`);
};

schema.statics.createOrUpdateIntegration = async function (
	userId: string,
	category: Integration,
	integration: PartialIntegration,
) {
	await this.updateOne({ userId, category }, { $set: integration }, { upsert: true });
};

schema.statics.getIntegrationByUserId = async function (userId: string, category: Integration) {
	return await this.findOne({ userId, category });
};

schema.statics.getIntegrations = async function (category: Integration, notifications?: boolean) {
	return typeof notifications === 'undefined'
		? await this.find({ category })
		: await this.find({ category, notifications });
};

schema.statics.updateWishlist = async function (userId: string, wishlist: Partial<SteamWishlistEntry>[]) {
	await this.updateOne({ userId, category: Integration.Steam }, { $set: { wishlist } });
};

schema.statics.updateRecentlyPlayed = async function (userId: string, recentlyPlayed: SteamRecentlyPlayedEntry[]) {
	await this.updateOne({ userId, category: Integration.Steam }, { $set: { recentlyPlayed } });
};

schema.statics.updateNotifications = async function (userId: string, notifications: boolean) {
	await this.updateOne({ userId, category: Integration.Steam }, { $set: { notifications } });
};

schema.statics.updateGamerscore = async function (userId: string, gamerscore: number) {
	await this.updateOne({ userId, category: Integration.Xbox }, { $set: { 'profile.gamerscore': gamerscore } });
};

schema.statics.resetWeeklyHours = async function () {
	await this.updateMany({ category: Integration.Steam }, { $set: { 'recentlyPlayed.$[].weeklyHours': 0 } });
};

schema.statics.deleteIntegrationByUserId = async function (userId: string, category: Integration) {
	await this.deleteOne({ userId, category });
};

export default mongoose.model<FullIntegration<PartialIntegration>, IntegrationModel>('integrations', schema);
