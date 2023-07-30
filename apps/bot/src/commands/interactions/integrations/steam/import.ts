import { IntegrationsModel, SteamIntegration, SubscriptionsModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('import')
	.setDescription('Create your Steam integration.')
	.addStringOption((option) => option.setName('profile').setDescription('Steam profile url.').setRequired(true));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const profile = interaction.options.getString('profile', true);

	const url = profile.match(/https?:\/\/steamcommunity\.com\/(profiles|id)\/([a-zA-Z0-9]+)/);
	if (!url) throw new Error('Invalid Steam profile url.');

	const { 1: type, 2: id } = url;
	const steamId = type === 'id' ? await client.api.gaming.steam.getSteamId64(id) : id;
	if (!steamId) throw new Error('No SteamId64 was found.');

	const rawWishlist = await client.api.gaming.steam.getWishlist(steamId);
	if (!rawWishlist) throw new Error('Steam wishlist is either private or empty.');

	const recentlyPlayed = await client.api.gaming.steam.getRecentlyPlayed(steamId);
	const wishlist = await Promise.all(
		rawWishlist.map(async (game) => {
			const rawSubscriptions = await SubscriptionsModel.getMatches({ name: game.name });
			const subscriptions = {
				xbox_game_pass: rawSubscriptions.some(({ provider }) => provider === 'Xbox Game Pass'),
				pc_game_pass: rawSubscriptions.some(({ provider }) => provider === 'PC Game Pass'),
				ubisoft_plus: rawSubscriptions.some(({ provider }) => provider === 'Ubisoft Plus'),
				ea_play_pro: rawSubscriptions.some(({ provider }) => provider === 'EA Play Pro'),
				ea_play: rawSubscriptions.some(({ provider }) => provider === 'EA Play'),
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
			profile: {
				id: steamId,
				url: `https://steamcommunity.com/profiles/${steamId}`,
			},
		},
	});

	const embed = new EmbedBuilder().setTitle('Steam account imported successfully.').setColor('Random');
	await interaction.editReply({ embeds: [embed] });
};
