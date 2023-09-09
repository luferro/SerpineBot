import { IntegrationsModel, XboxIntegration } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.integrations.xbox.import.name'))
	.setDescription(t('interactions.integrations.xbox.import.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.integrations.xbox.import.options.0.name'))
			.setDescription(t('interactions.integrations.xbox.import.options.0.description'))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const gamertag = interaction.options.getString(t('interactions.integrations.xbox.import.options.0.name'), true);

	const isGamertagValid = await client.api.gaming.xbox.isGamertagValid(gamertag);
	if (!isGamertagValid) throw new Error(t('errors.xbox.profile.gamertag'));

	const { gamerscore } = await client.api.gaming.xbox.getProfile(gamertag);
	await IntegrationsModel.createIntegration<XboxIntegration>({
		userId: interaction.user.id,
		category: 'Xbox',
		partialIntegration: { profile: { gamertag, gamerscore } },
	});

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.integrations.xbox.import.embed.title'))
		.setColor('Random');
	await interaction.editReply({ embeds: [embed] });
};
