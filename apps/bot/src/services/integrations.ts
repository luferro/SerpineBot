import { IntegrationEnum, IntegrationsModel } from '@luferro/database';
import { SteamApi, XboxApi } from '@luferro/games-api';

import * as Subscriptions from './subscriptions';

export const createIntegration = async (category: IntegrationEnum, userId: string, account: string) => {
	const select: Record<typeof category, (arg0: string, arg1: string) => Promise<void>> = {
		[IntegrationEnum.Steam]: createSteamIntegration,
		[IntegrationEnum.Xbox]: createXboxIntegration,
	};

	await select[category](userId, account);
};

const createSteamIntegration = async (userId: string, url: string) => {
	await IntegrationsModel.checkIfIntegrationIsNotInPlace(userId, IntegrationEnum.Steam);

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

			return { ...game, subscriptions, notified: false };
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

	await IntegrationsModel.createOrUpdateIntegration(userId, IntegrationEnum.Steam, integrationInfo);
};

const createXboxIntegration = async (userId: string, gamertag: string) => {
	await IntegrationsModel.checkIfIntegrationIsNotInPlace(userId, IntegrationEnum.Xbox);

	const isGamertagValid = await XboxApi.isGamertagValid(gamertag);
	if (!isGamertagValid) throw new Error('Invalid Xbox gamertag.');

	const { name, gamerscore } = await XboxApi.getProfile(gamertag);

	const integrationInfo = {
		profile: {
			gamertag: name,
			gamerscore,
		},
	};

	await IntegrationsModel.createOrUpdateIntegration(userId, IntegrationEnum.Xbox, integrationInfo);
};

export const syncIntegration = async (category: IntegrationEnum.Steam, userId: string) => {
	await IntegrationsModel.checkIfIntegrationIsInPlace(userId, category);

	const integration = await IntegrationsModel.getIntegrationByUserId(userId, category);
	const wishlist = await SteamApi.getWishlist(integration.profile.id);
	if (!wishlist) throw new Error('Steam wishlist is either private or empty.');

	const wishlistItems = wishlist.map((game) => {
		const storedItem = integration.wishlist.find(({ id: nestedStoredItemId }) => nestedStoredItemId === game.id);
		return { ...game, notified: storedItem?.notified ?? false };
	});

	await IntegrationsModel.updateWishlist(userId, wishlistItems);
};

export const deleteIntegration = async (category: IntegrationEnum, userId: string) => {
	await IntegrationsModel.checkIfIntegrationIsInPlace(userId, category);
	await IntegrationsModel.deleteIntegrationByUserId(userId, category);
};

export const toggleNotifications = async (category: IntegrationEnum.Steam, userId: string, notifications: boolean) => {
	await IntegrationsModel.checkIfIntegrationIsInPlace(userId, category);
	await IntegrationsModel.updateNotifications(userId, notifications);
};
