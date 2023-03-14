import mongoose, { Model, Schema } from 'mongoose';

import { IntegrationEnum } from '../../types/enum';
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
	checkIfIntegrationIsInPlace: (userId: string, category: IntegrationEnum) => Promise<void>;
	checkIfIntegrationIsNotInPlace: (userId: string, category: IntegrationEnum) => Promise<void>;
	createOrUpdateIntegration: ((
		userId: string,
		category: IntegrationEnum.Steam,
		integration: SteamIntegration,
	) => Promise<void>) &
		((userId: string, category: IntegrationEnum.Xbox, integration: XboxIntegration) => Promise<void>);
	getIntegrationByUserId: ((
		userId: string,
		category: IntegrationEnum.Steam,
	) => Promise<Integration<SteamIntegration>>) &
		((userId: string, category: IntegrationEnum.Xbox) => Promise<Integration<XboxIntegration>>);
	getIntegrations: ((
		category: IntegrationEnum.Steam,
		notifications?: boolean,
	) => Promise<Integration<SteamIntegration>[]>) &
		((category: IntegrationEnum.Xbox) => Promise<Integration<XboxIntegration>[]>);
	updateWishlist: (userId: string, wishlist: Partial<SteamWishlistEntry>[]) => Promise<void>;
	updateRecentlyPlayed: (userId: string, recentlyPlayed: SteamRecentlyPlayedEntry[]) => Promise<void>;
	updateNotifications: (userId: string, notifications: boolean) => Promise<void>;
	updateGamerscore: (userId: string, gamerscore: number) => Promise<void>;
	resetWeeklyHours: () => Promise<void>;
	deleteIntegrationByUserId: (userId: string, category: IntegrationEnum) => Promise<void>;
}

const schema = new mongoose.Schema<Integration<PartialIntegration>>({
	userId: { type: String, required: true },
	category: { type: Number, enum: IntegrationEnum },
	profile: { type: Schema.Types.Mixed },
	wishlist: { type: Schema.Types.Mixed },
	recentlyPlayed: { type: Schema.Types.Mixed },
	notifications: { type: Schema.Types.Mixed },
});

schema.statics.checkIfIntegrationIsInPlace = async function (userId: string, category: IntegrationEnum) {
	const isInPlace = await this.exists({ userId, category });
	if (!isInPlace) throw new Error(`No ${IntegrationEnum[category]} integration is in place.`);
};

schema.statics.checkIfIntegrationIsNotInPlace = async function (userId: string, category: IntegrationEnum) {
	const isInPlace = await this.exists({ userId, category });
	if (isInPlace) throw new Error(`${IntegrationEnum[category]} integration is already in place.`);
};

schema.statics.createOrUpdateIntegration = async function (
	userId: string,
	category: IntegrationEnum,
	integration: PartialIntegration,
) {
	await this.updateOne({ userId, category }, { $set: integration }, { upsert: true });
};

schema.statics.getIntegrationByUserId = async function (userId: string, category: IntegrationEnum) {
	return await this.findOne({ userId, category });
};

schema.statics.getIntegrations = async function (category: IntegrationEnum, notifications?: boolean) {
	return typeof notifications === 'undefined'
		? await this.find({ category })
		: await this.find({ category, notifications });
};

schema.statics.updateWishlist = async function (userId: string, wishlist: Partial<SteamWishlistEntry>[]) {
	await this.updateOne({ userId, category: IntegrationEnum.Steam }, { $set: { wishlist } });
};

schema.statics.updateRecentlyPlayed = async function (userId: string, recentlyPlayed: SteamRecentlyPlayedEntry[]) {
	await this.updateOne({ userId, category: IntegrationEnum.Steam }, { $set: { recentlyPlayed } });
};

schema.statics.updateNotifications = async function (userId: string, notifications: boolean) {
	await this.updateOne({ userId, category: IntegrationEnum.Steam }, { $set: { notifications } });
};

schema.statics.updateGamerscore = async function (userId: string, gamerscore: number) {
	await this.updateOne({ userId, category: IntegrationEnum.Xbox }, { $set: { 'profile.gamerscore': gamerscore } });
};

schema.statics.resetWeeklyHours = async function () {
	await this.updateMany({ category: IntegrationEnum.Steam }, { $set: { 'recentlyPlayed.$[].weeklyHours': 0 } });
};

schema.statics.deleteIntegrationByUserId = async function (userId: string, category: IntegrationEnum) {
	await this.deleteOne({ userId, category });
};

export default mongoose.model<Integration<PartialIntegration>, IntegrationModel>('integrations', schema);
