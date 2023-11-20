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
	const gamertag = interaction.options.getString(data.options[0].name, true);

	const exists = await client.prisma.xbox.exists({ where: { userId: interaction.user.id } });
	if (!exists) throw new Error('errors.unprocessable');

	const isGamertagValid = await client.api.gaming.platforms.xbox.isGamertagValid({ gamertag });
	if (!isGamertagValid) throw new Error(t('errors.xbox.profile.gamertag'));

	const { name, gamerscore } = await client.api.gaming.platforms.xbox.getProfile({ gamertag });
	await client.prisma.xbox.create({ data: { userId: interaction.user.id, profile: { gamertag: name, gamerscore } } });

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.integrations.xbox.import.embed.title'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
