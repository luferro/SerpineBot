import { IntegrationsModel, XboxIntegration } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('import')
	.setDescription('Create your Xbox integration.')
	.addStringOption((option) => option.setName('gamertag').setDescription('Xbox gamertag.').setRequired(true));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const gamertag = interaction.options.getString('gamertag', true);

	const isGamertagValid = await client.api.gaming.xbox.isGamertagValid(gamertag);
	if (!isGamertagValid) throw new Error('Invalid Xbox gamertag.');

	const { name, gamerscore } = await client.api.gaming.xbox.getProfile(gamertag);
	await IntegrationsModel.createIntegration<XboxIntegration>({
		userId: interaction.user.id,
		category: 'Xbox',
		partialIntegration: {
			profile: {
				gamertag: name,
				gamerscore,
			},
		},
	});

	const embed = new EmbedBuilder().setTitle('Xbox account imported successfully.').setColor('Random');
	await interaction.editReply({ embeds: [embed] });
};
