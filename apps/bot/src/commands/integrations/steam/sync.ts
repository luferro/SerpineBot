import { Integration, IntegrationsModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('sync')
	.setDescription('Manually synchronize your Steam integration.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	await IntegrationsModel.checkIfIntegrationIsInPlace(interaction.user.id, Integration.Steam);

	const integration = await IntegrationsModel.getIntegrationByUserId(interaction.user.id, Integration.Steam);
	const wishlist = await client.api.gaming.steam.getWishlist(integration.profile.id);
	if (!wishlist) throw new Error('Steam wishlist is either private or empty.');

	const updatedWishlist = wishlist.map((game) => {
		const storedItem = integration.wishlist.find(({ id: nestedStoredItemId }) => nestedStoredItemId === game.id);
		return { ...game, notified: storedItem?.notified ?? false };
	});
	await IntegrationsModel.updateWishlist(interaction.user.id, updatedWishlist);

	const embed = new EmbedBuilder().setTitle('Steam integration synced successfully.').setColor('Random');
	await interaction.editReply({ embeds: [embed] });
};
