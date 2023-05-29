import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('sales')
	.setDescription("Steam's next sales.");

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const { sale, status, upcoming } = await client.api.gaming.steam.getNextSales();
	if (!sale) throw new Error('No dates were found for the next steam sales.');

	const embed = new EmbedBuilder()
		.setTitle('When is the next Steam sale?')
		.setDescription(`*${status || ''}*\n**${sale}**`)
		.addFields([
			{
				name: '**Upcoming Sales**',
				value: upcoming.join('\n') || 'N/A',
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};