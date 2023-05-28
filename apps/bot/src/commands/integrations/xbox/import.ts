import { Integration, IntegrationsModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('import')
	.setDescription('Create your Xbox integration.')
	.addStringOption((option) => option.setName('gamertag').setDescription('Xbox gamertag.').setRequired(true));

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const gamertag = interaction.options.getString('gamertag', true);

	await IntegrationsModel.checkIfIntegrationIsNotInPlace(interaction.user.id, Integration.Xbox);

	const isGamertagValid = await client.api.gaming.xbox.isGamertagValid(gamertag);
	if (!isGamertagValid) throw new Error('Invalid Xbox gamertag.');

	const { name, gamerscore } = await client.api.gaming.xbox.getProfile(gamertag);
	await IntegrationsModel.createOrUpdateIntegration(interaction.user.id, Integration.Xbox, {
		profile: {
			gamertag: name,
			gamerscore,
		},
	});

	const embed = new EmbedBuilder().setTitle('Xbox account imported successfully.').setColor('Random');
	await interaction.editReply({ embeds: [embed] });
};
