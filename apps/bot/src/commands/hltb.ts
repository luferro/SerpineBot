import { HowLongToBeatApi } from '@luferro/games-api';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../types/bot';
import { CommandName } from '../types/enums';

export const data: CommandData = {
	name: CommandName.HowLongToBeat,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.HowLongToBeat)
		.setDescription('Average playtime required to beat a given game.')
		.addStringOption((option) => option.setName('game').setDescription('Game title.').setRequired(true)),
};

export const execute: CommandExecute = async ({ interaction }) => {
	const game = interaction.options.getString('game', true);

	const { id } = await HowLongToBeatApi.search(game);
	if (!id) throw new Error(`No matches for ${game}.`);

	const {
		name,
		image,
		playtimes: { main, mainExtra, completionist },
	} = await HowLongToBeatApi.getGameById(id);

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

	await interaction.reply({ embeds: [embed] });
};
