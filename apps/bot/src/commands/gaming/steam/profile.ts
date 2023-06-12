import { IntegrationsModel, SteamIntegration } from '@luferro/database';
import { DateUtil } from '@luferro/shared-utils';
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
	const integration = await IntegrationsModel.getIntegration<SteamIntegration>({ userId, category: 'Steam' });
	if (!integration) throw new Error('No Steam integration in place.');

	const { profile } = integration;
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
				value: DateUtil.formatDate(createdAt),
				inline: true,
			},
			{
				name: '**Last logout at**',
				value: DateUtil.formatDate(logoutAt),
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
