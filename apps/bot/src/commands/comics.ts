import type { ComicSelection } from '@luferro/go-comics-api';
import { GoComicsApi } from '@luferro/go-comics-api';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../types/bot';
import { CommandName } from '../types/enums';

export const data: CommandData = {
	name: CommandName.Comics,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Comics)
		.setDescription('Random comic page from the available selection.')
		.addStringOption((option) =>
			option
				.setName('selection')
				.setDescription('Comic selection.')
				.setRequired(true)
				.addChoices(
					{ name: 'Garfield', value: 'Garfield' },
					{ name: 'Peanuts', value: 'Peanuts' },
					{ name: 'Get Fuzzy', value: 'Get Fuzzy' },
					{ name: 'Fowl Language', value: 'Fowl Language' },
					{ name: 'Calvin and Hobbes', value: 'Calvin and Hobbes' },
					{ name: 'Jake Likes Onions', value: 'Jake Likes Onions' },
					{ name: "Sarah's Scribbles", value: 'Sarahs Scribbles' },
					{ name: 'Worry Lines', value: 'Worry Lines' },
				),
		),
};

export const execute: CommandExecute = async ({ interaction }) => {
	const selection = interaction.options.getString('selection', true) as ComicSelection;

	const { title, url, image } = await GoComicsApi.getRandomComicPage(selection);
	if (!title || !url || !image) throw new Error('No comic was found.');

	const embed = new EmbedBuilder().setTitle(title).setURL(url).setImage(image).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};
