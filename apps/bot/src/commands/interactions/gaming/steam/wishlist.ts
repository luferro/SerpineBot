import { IntegrationsModel, SteamIntegration } from '@luferro/database';
import { EmbedBuilder, GuildMember, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.gaming.steam.wishlist.name'))
	.setDescription(t('interactions.gaming.steam.wishlist.description'))
	.addMentionableOption((option) =>
		option
			.setName(t('interactions.gaming.steam.wishlist.options.0.name'))
			.setDescription(t('interactions.gaming.steam.wishlist.options.0.description')),
	);

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	await interaction.deferReply();

	const mention = interaction.options.getMentionable(
		t('interactions.gaming.steam.wishlist.options.0.name'),
	) as GuildMember | null;

	const user = mention?.user ?? interaction.user;
	const integration = await IntegrationsModel.getIntegration<SteamIntegration>({
		userId: user.id,
		category: 'Steam',
	});
	if (!integration) throw new Error(t('errors.unprocessable'));

	const { profile, wishlist } = integration;

	const formattedWishlist = wishlist
		.slice(0, 10)
		.map(
			({ name, url, discounted, free }, index) =>
				`\`${index + 1}.\` **[${name}](${url})** | ${discounted || (free && 'Free') || 'N/A'}`,
		);
	const hiddenCount = wishlist.length - formattedWishlist.length;
	if (hiddenCount > 0) formattedWishlist.push(t('common.list.footer', { size: hiddenCount }));

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.gaming.steam.wishlist.embed.title', { username: `\`${user.username}\`` }))
		.setURL(`https://store.steampowered.com/wishlist/profiles/${profile.id}/#sort=order`)
		.setDescription(formattedWishlist.join('\n'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
