import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { JokeCategory, JokesApi } from '@luferro/jokes-api';
import { CommandName } from '../types/enums';

export const data = {
	name: CommandName.Jokes,
	isClientRequired: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Jokes)
		.setDescription('Random joke from the available options.')
		.addStringOption((option) =>
			option
				.setName('category')
				.setDescription('Joke category.')
				.setRequired(true)
				.addChoices(
					{ name: 'Dark Joke', value: 'Dark' },
					{ name: 'Programming Joke', value: 'Programming' },
					{ name: 'Miscellaneous Joke', value: 'Miscellaneous' },
				),
		),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const category = interaction.options.getString('category', true) as JokeCategory;

	const { joke } = await JokesApi.getRandomJokeByCategory(category);

	const embed = new EmbedBuilder().setTitle(`${category} joke`).setDescription(joke).setColor('Random');

	await interaction.reply({ embeds: [embed] });
};
