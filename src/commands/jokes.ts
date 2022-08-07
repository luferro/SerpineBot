import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as Jokes from '../apis/jokes';
import { CommandName, JokeCategory } from '../types/enums';

export const data = {
	name: CommandName.Jokes,
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Jokes)
		.setDescription('Random joke from the available options.')
		.addIntegerOption((option) =>
			option
				.setName('category')
				.setDescription('Joke category.')
				.setRequired(true)
				.addChoices(
					{ name: 'Dark Joke', value: JokeCategory.Dark },
					{ name: 'Programming Joke', value: JokeCategory.Programming },
					{ name: 'Miscellaneous Joke', value: JokeCategory.Miscellaneous },
				),
		),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const category = interaction.options.getInteger('category', true) as JokeCategory;

	const { joke } = await Jokes.getJokeByCategory(category);

	const embed = new EmbedBuilder().setTitle(`${JokeCategory[category]} joke`).setDescription(joke).setColor('Random');

	await interaction.reply({ embeds: [embed] });
};
