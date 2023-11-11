import { IntegrationsModel, SteamIntegration, SubscriptionsModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.integrations.steam.import.name'))
	.setDescription(t('interactions.integrations.steam.import.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.integrations.steam.import.options.0.name'))
			.setDescription(t('interactions.integrations.steam.import.options.0.description'))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const profile = interaction.options.getString(t('interactions.integrations.steam.import.options.0.name'), true);

	const url = profile.match(/https?:\/\/steamcommunity\.com\/(profiles|id)\/([a-zA-Z0-9]+)/);
	if (!url) throw new Error(t('errors.steam.profile.url'));

	const { 1: type, 2: id } = url;
	const steamId64 = type === 'id' ? await client.api.gaming.platforms.steam.getSteamId64({ id }) : id;
	if (!steamId64) throw new Error(t('errors.steam.steamId64'));

	const rawWishlist = await client.api.gaming.platforms.steam.getWishlist({ id: steamId64 });
	if (!rawWishlist) throw new Error(t('errors.steam.wishlist.private'));

	const recentlyPlayed = await client.api.gaming.platforms.steam.getRecentlyPlayed({ id: steamId64 });
	const wishlist = await Promise.all(
		rawWishlist.map(async (game) => {
			const services = await SubscriptionsModel.getGamingServices({ name: game.name });
			const subscriptions = {
				xbox_game_pass: services.some(({ provider }) => provider === 'Xbox Game Pass'),
				pc_game_pass: services.some(({ provider }) => provider === 'PC Game Pass'),
				ubisoft_plus: services.some(({ provider }) => provider === 'Ubisoft Plus'),
				ea_play_pro: services.some(({ provider }) => provider === 'EA Play Pro'),
				ea_play: services.some(({ provider }) => provider === 'EA Play'),
			};
			return { ...game, subscriptions, notified: false };
		}),
	);

	await IntegrationsModel.createIntegration<SteamIntegration>({
		userId: interaction.user.id,
		category: 'Steam',
		partialIntegration: {
			wishlist,
			recentlyPlayed: recentlyPlayed.map((game) => ({ ...game, weeklyHours: 0 })),
			notifications: true,
			profile: { id: steamId64, url: `https://steamcommunity.com/profiles/${steamId64}` },
		},
	});

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.integrations.steam.import.embed.title'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
