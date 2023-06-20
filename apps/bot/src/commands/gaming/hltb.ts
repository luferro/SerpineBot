import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('hltb')
	.setDescription('Average playtime to beat a game.')
	.addStringOption((option) => option.setName('query').setDescription('Game title.').setRequired(true));

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const query = interaction.options.getString('query', true);

	const { id } = await client.api.gaming.playtimes.search(query);
	if (!id) throw new Error(`No matches for ${query}.`);

	const { name, image, playtimes } = await client.api.gaming.playtimes.getGameById(id);
	const { main, mainExtra, completionist } = playtimes;

	const hasPlaytimes = main || mainExtra || completionist;
	if (!hasPlaytimes) throw new Error(`No playtimes were found for ${name}.`);

	const embed = new EmbedBuilder()
		.setTitle(`How long to beat \`${name}\``)
		.setURL(`https://howlongtobeat.com/game/${id}`)
		.setThumbnail(image)
		.addFields([
			{
				name: '**Main Story**',
				value: main ? `~${main}` : 'N/A',
				inline: true,
			},
			{
				name: '**Main Story + Extras**',
				value: mainExtra ? `~${mainExtra}` : 'N/A',
				inline: true,
			},
			{
				name: '**Completionist**',
				value: completionist ? `~${completionist}` : 'N/A',
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
