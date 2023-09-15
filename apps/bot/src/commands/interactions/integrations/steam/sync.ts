import { IntegrationsModel, SteamIntegration } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.integrations.steam.sync.name'))
	.setDescription(t('interactions.integrations.steam.sync.description'));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const userId = interaction.user.id;
	const integration = await IntegrationsModel.getIntegration<SteamIntegration>({ userId, category: 'Steam' });
	if (!integration) throw new Error(t('errors.unprocessable'));

	const wishlist = await client.api.gaming.steam.getWishlist({ steamId64: integration.profile.id });
	if (!wishlist) throw new Error(t('errors.steam.wishlist.private'));

	const updatedWishlist = wishlist.map((game) => {
		const storedItem = integration.wishlist.find(({ id: nestedStoredItemId }) => nestedStoredItemId === game.id);
		return { ...game, notified: storedItem?.notified ?? false };
	});
	await IntegrationsModel.updateWishlist({ userId, wishlist: updatedWishlist });

	const embed = new EmbedBuilder().setTitle(t('interactions.integrations.steam.sync.embed.title')).setColor('Random');
	await interaction.editReply({ embeds: [embed] });
};
