import { Integration, IntegrationsModel } from '@luferro/database';
import { EmbedBuilder, GuildMember, SlashCommandSubcommandBuilder } from 'discord.js';

import { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('profile')
	.setDescription('Steam profile for your account/mentioned user.')
	.addMentionableOption((option) => option.setName('mention').setDescription('User mention.'));

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const mention = interaction.options.getMentionable('mention') as GuildMember | null;

	const userId = mention?.user.id ?? interaction.user.id;
	await IntegrationsModel.checkIfIntegrationIsInPlace(userId, Integration.Steam);
	const { profile } = await IntegrationsModel.getIntegrationByUserId(userId, Integration.Steam);
	const { name, image, status, logoutAt, createdAt } = await client.api.gaming.steam.getProfile(profile.id);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(profile.url)
		.setThumbnail(image)
		.addFields([
			{
				name: '**SteamId64**',
				value: profile.id,
			},
			{
				name: '**Status**',
				value: status,
			},
			{
				name: '**Created at**',
				value: createdAt,
				inline: true,
			},
			{
				name: '**Last logout at**',
				value: logoutAt,
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
