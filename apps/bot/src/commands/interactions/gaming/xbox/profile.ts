import { IntegrationsModel, XboxIntegration } from '@luferro/database';
import { EmbedBuilder, GuildMember, SlashCommandSubcommandBuilder } from 'discord.js';

import { InteractionCommandExecute, InteractionCommandData } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('profile')
	.setDescription('Xbox profile for your account/mentioned user.')
	.addMentionableOption((option) => option.setName('mention').setDescription('User mention.'));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const mention = interaction.options.getMentionable('mention') as GuildMember | null;

	const userId = mention?.user.id ?? interaction.user.id;
	const integration = await IntegrationsModel.getIntegration<XboxIntegration>({ userId, category: 'Xbox' });
	if (!integration) throw new Error('No Steam integration in place.');

	const { profile } = integration;
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
