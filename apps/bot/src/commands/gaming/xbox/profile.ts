import { Integration, IntegrationsModel } from '@luferro/database';
import { EmbedBuilder, GuildMember, SlashCommandSubcommandBuilder } from 'discord.js';

import { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('profile')
	.setDescription('Xbox profile for your account/mentioned user.')
	.addMentionableOption((option) => option.setName('mention').setDescription('User mention.'));

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const mention = interaction.options.getMentionable('mention') as GuildMember | null;

	const userId = mention?.user.id ?? interaction.user.id;
	await IntegrationsModel.checkIfIntegrationIsInPlace(userId, Integration.Xbox);
	const { profile } = await IntegrationsModel.getIntegrationByUserId(userId, Integration.Xbox);
	const { name, image, gamerscore, gamesPlayed } = await client.api.gaming.xbox.getProfile(profile.gamertag);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setThumbnail(image)
		.addFields([
			{
				name: '**Gamerscore**',
				value: gamerscore.toString(),
			},
			{
				name: '**Games played**',
				value: gamesPlayed.toString(),
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
