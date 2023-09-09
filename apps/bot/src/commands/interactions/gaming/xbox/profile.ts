import { IntegrationsModel, XboxIntegration } from '@luferro/database';
import { EmbedBuilder, GuildMember, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.gaming.xbox.profile.name'))
	.setDescription(t('interactions.gaming.xbox.profile.description'))
	.addMentionableOption((option) =>
		option
			.setName(t('interactions.gaming.xbox.profile.options.0.name'))
			.setDescription(t('interactions.gaming.xbox.profile.options.0.description')),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const mention = interaction.options.getMentionable(
		t('interactions.gaming.xbox.profile.options.0.name'),
	) as GuildMember | null;

	const userId = mention?.user.id ?? interaction.user.id;
	const integration = await IntegrationsModel.getIntegration<XboxIntegration>({ userId, category: 'Xbox' });
	if (!integration) throw new Error(t('errors.unprocessable'));

	const { profile } = integration;
	const { name, image, gamerscore, gamesPlayed } = await client.api.gaming.xbox.getProfile(profile.gamertag);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setThumbnail(image)
		.addFields([
			{
				name: `**${t('gaming.xbox.profile.embed.fields.0.name')}**`,
				value: gamerscore.toString(),
			},
			{
				name: `**${t('gaming.xbox.profile.embed.fields.1.name')}**`,
				value: gamesPlayed.toString(),
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
