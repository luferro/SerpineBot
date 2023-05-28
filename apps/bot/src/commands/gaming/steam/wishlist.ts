import { Integration, IntegrationsModel } from '@luferro/database';
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
	await IntegrationsModel.checkIfIntegrationIsInPlace(user.id, Integration.Steam);
	const integration = await IntegrationsModel.getIntegrationByUserId(user.id, Integration.Steam);

	const formattedWishlist = integration.wishlist
		.slice(0, 10)
		.map(
			({ name, url, discounted, free }, index) =>
				`\`${index + 1}.\` **[${name}](${url})** | ${discounted || (free && 'Free') || 'N/A'}`,
		);
	const hiddenCount = integration.wishlist.length - formattedWishlist.length;
	if (hiddenCount > 0) formattedWishlist.push(`And ${hiddenCount} more!`);

	const embed = new EmbedBuilder()
		.setTitle(`\`${user.tag}\`'s wishlist`)
		.setURL(`https://store.steampowered.com/wishlist/profiles/${integration.profile.id}/#sort=order`)
		.setDescription(formattedWishlist.join('\n'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
