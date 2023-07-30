import { IntegrationsModel, SteamIntegration } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('sync')
	.setDescription('Manually synchronize your Steam integration.');

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const userId = interaction.user.id;
	const integration = await IntegrationsModel.getIntegration<SteamIntegration>({ userId, category: 'Steam' });
	if (!integration) throw new Error('No Steam integration in place.');

	const wishlist = await client.api.gaming.steam.getWishlist(integration.profile.id);
	if (!wishlist) throw new Error('Steam wishlist is either private or empty.');

	const updatedWishlist = wishlist.map((game) => {
		const storedItem = integration.wishlist.find(({ id: nestedStoredItemId }) => nestedStoredItemId === game.id);
		return { ...game, notified: storedItem?.notified ?? false };
	});
	await IntegrationsModel.updateWishlist({ userId, wishlist: updatedWishlist });

	const embed = new EmbedBuilder().setTitle('Steam integration synced successfully.').setColor('Random');
	await interaction.editReply({ embeds: [embed] });
};
