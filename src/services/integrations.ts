import * as Steam from '../apis/steam';
import { steamModel } from '../database/models/steam';

export const create = async (userId: string, url: string) => {
	const integration = await steamModel.findOne({ userId });
	if (integration) throw new Error('A Steam integration is already in place.');

	const profileUrl = url.match(/https?:\/\/steamcommunity\.com\/(profiles|id)\/([a-zA-Z0-9]+)/);
	if (!profileUrl) throw new Error('Invalid Steam profile url.');

	const { 2: customId } = profileUrl;
	const steamId = await Steam.getSteamId64(customId);
	if (!steamId) throw new Error('No SteamId64 was found.');

	const wishlist = await Steam.getWishlist(steamId);
	if (!wishlist) throw new Error('Steam wishlist is either private or empty.');

	const recentlyPlayed = (await Steam.getRecentlyPlayed(steamId)) ?? [];

	const integrationInfo = {
		profile: {
			id: steamId,
			url: `https://steamcommunity.com/profiles/${steamId}`,
		},
		wishlist: wishlist.map((game) => ({ ...game, notified: false })),
		recentlyPlayed: recentlyPlayed.map((game) => ({ ...game, weeklyHours: 0 })),
		notifications: true,
	};

	await steamModel.updateOne({ userId }, { $set: integrationInfo }, { upsert: true });
};

export const sync = async (userId: string) => {
	const integration = await steamModel.findOne({ userId });
	if (!integration) throw new Error('No Steam integration is in place.');

	const wishlist = await Steam.getWishlist(integration.profile.id);
	if (!wishlist) throw new Error('Steam wishlist is either private or empty.');

	const wishlistItems = wishlist.map((game) => {
		const storedItem = integration.wishlist.find(({ id: nestedStoredItemId }) => nestedStoredItemId === game.id);

		return {
			...game,
			notified: storedItem?.notified ?? false,
		};
	});

	await steamModel.updateOne({ userId }, { $set: { 'wishlist.items': wishlistItems } });
};

export const remove = async (userId: string) => {
	const integration = await steamModel.findOne({ userId });
	if (!integration) throw new Error('No Steam integration is in place.');

	await steamModel.deleteOne({ userId });
};

export const notifications = async (userId: string, notifications: boolean) => {
	const integration = await steamModel.findOne({ userId });
	if (!integration) throw new Error('No Steam integration is in place.');

	await steamModel.updateOne({ userId }, { $set: { notifications } });
};
