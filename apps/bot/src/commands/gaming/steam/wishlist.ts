import { IntegrationsModel, SteamIntegration } from '@luferro/database';
import { EmbedBuilder, GuildMember, SlashCommandSubcommandBuilder } from 'discord.js';

import { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('wishlist')
	.setDescription('Steam wishlist for your account/mentioned user.')
	.addMentionableOption((option) => option.setName('mention').setDescription('User mention.'));

export const execute: CommandExecute = async ({ interaction }) => {
	await interaction.deferReply();

	const mention = interaction.options.getMentionable('mention') as GuildMember | null;

	const user = mention?.user ?? interaction.user;
	const integration = await IntegrationsModel.getIntegration<SteamIntegration>({
		userId: user.id,
		category: 'Steam',
	});
	if (!integration) throw new Error('No Steam integration in place.');

	const { profile, wishlist } = integration;

	const formattedWishlist = wishlist
		.slice(0, 10)
		.map(
			({ name, url, discounted, free }, index) =>
				`\`${index + 1}.\` **[${name}](${url})** | ${discounted || (free && 'Free') || 'N/A'}`,
		);
	const hiddenCount = wishlist.length - formattedWishlist.length;
	if (hiddenCount > 0) formattedWishlist.push(`And ${hiddenCount} more!`);

	const embed = new EmbedBuilder()
		.setTitle(`\`${user.username}\`'s wishlist`)
		.setURL(`https://store.steampowered.com/wishlist/profiles/${profile.id}/#sort=order`)
		.setDescription(formattedWishlist.join('\n'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
