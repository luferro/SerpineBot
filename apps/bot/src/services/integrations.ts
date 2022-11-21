import type { IntegrationCategory } from '../types/category';
import { SteamApi, XboxApi } from '@luferro/games-api';
import * as Subscriptions from './subscriptions';
import { steamModel } from '../database/models/steam';
import { xboxModel } from '../database/models/xbox';

export const create = async (category: IntegrationCategory, userId: string, account: string) => {
	const integrations: Record<typeof category, (arg0: string, arg1: string) => Promise<void>> = {
		Steam: createSteamIntegration,
		Xbox: createXboxIntegration,
	};

	await integrations[category](userId, account);
};

const createSteamIntegration = async (userId: string, url: string) => {
	const integration = await steamModel.findOne({ userId });
	if (integration) throw new Error('A Steam integration is already in place.');

	const profileUrl = url.match(/https?:\/\/steamcommunity\.com\/(profiles|id)\/([a-zA-Z0-9]+)/);
	if (!profileUrl) throw new Error('Invalid Steam profile url.');

	const { 1: type, 2: id } = profileUrl;
	const steamId = type === 'id' ? await SteamApi.getSteamId64(id) : id;
	if (!steamId) throw new Error('No SteamId64 was found.');

	const steamWishlist = await SteamApi.getWishlist(steamId);
	if (!steamWishlist) throw new Error('Steam wishlist is either private or empty.');

	const recentlyPlayed = await SteamApi.getRecentlyPlayed(steamId);

	const wishlist = await Promise.all(
		steamWishlist.map(async (game) => {
			const gamingSubscriptions = await Subscriptions.getGamingSubscriptions(game.name);
			const subscriptions = {
				xbox_game_pass: gamingSubscriptions.some(({ name }) => name === 'Xbox Game Pass'),
				pc_game_pass: gamingSubscriptions.some(({ name }) => name === 'PC Game Pass'),
				ubisoft_plus: gamingSubscriptions.some(({ name }) => name === 'Ubisoft Plus'),
				ea_play_pro: gamingSubscriptions.some(({ name }) => name === 'EA Play Pro'),
				ea_play: gamingSubscriptions.some(({ name }) => name === 'EA Play'),
			};

			return {
				...game,
				subscriptions,
				notified: false,
			};
		}),
	);

	const integrationInfo = {
		wishlist,
		recentlyPlayed: recentlyPlayed.map((game) => ({ ...game, weeklyHours: 0 })),
		notifications: true,
		profile: {
			id: steamId,
			url: `https://steamcommunity.com/profiles/${steamId}`,
		},
	};

	await steamModel.updateOne({ userId }, { $set: integrationInfo }, { upsert: true });
};

const createXboxIntegration = async (userId: string, gamertag: string) => {
	const integration = await xboxModel.findOne({ userId });
	if (integration) throw new Error('A Xbox integration is already in place.');

	const isGamertagValid = await XboxApi.isGamertagValid(gamertag);
	if (!isGamertagValid) throw new Error('Invalid Xbox gamertag.');

	const { name, gamerscore } = await XboxApi.getProfile(gamertag);

	const integrationInfo = {
		profile: {
			gamertag: name,
			gamerscore,
		},
	};

	await xboxModel.updateOne({ userId }, { $set: integrationInfo }, { upsert: true });
};

export const sync = async (category: Exclude<IntegrationCategory, 'Xbox'>, userId: string) => {
	const integrations: Record<typeof category, (arg0: string) => Promise<void>> = {
		Steam: syncSteamIntegration,
	};

	await integrations[category](userId);
};

const syncSteamIntegration = async (userId: string) => {
	const integration = await steamModel.findOne({ userId });
	if (!integration) throw new Error('No Steam integration is in place.');

	const wishlist = await SteamApi.getWishlist(integration.profile.id);
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

export const remove = async (category: IntegrationCategory, userId: string) => {
	const integrations: Record<typeof category, (arg0: string) => Promise<void>> = {
		Steam: removeSteamIntegration,
		Xbox: removeXboxIntegration,
	};

	await integrations[category](userId);
};

const removeSteamIntegration = async (userId: string) => {
	const integration = await steamModel.findOne({ userId });
	if (!integration) throw new Error('No Steam integration is in place.');

	await steamModel.deleteOne({ userId });
};

const removeXboxIntegration = async (userId: string) => {
	const integration = await xboxModel.findOne({ userId });
	if (!integration) throw new Error('No Xbox integration is in place.');

	await xboxModel.deleteOne({ userId });
};

export const notifications = async (
	category: Exclude<IntegrationCategory, 'Xbox'>,
	userId: string,
	notifications: boolean,
) => {
	const integrations: Record<typeof category, (arg0: string, arg1: boolean) => Promise<void>> = {
		Steam: steamIntegrationNotifications,
	};

	await integrations[category](userId, notifications);
};

const steamIntegrationNotifications = async (userId: string, notifications: boolean) => {
	const integration = await steamModel.findOne({ userId });
	if (!integration) throw new Error('No Steam integration is in place.');

	await steamModel.updateOne({ userId }, { $set: { notifications } });
};
