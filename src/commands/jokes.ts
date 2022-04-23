import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as Jokes from '../apis/jokes';
import { JokeCategories } from '../types/categories';

export const data = {
	name: 'jokes',
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName('jokes')
		.setDescription('Returns a random joke.')
		.addStringOption((option) =>
			option
				.setName('category')
				.setDescription('Joke category.')
				.setRequired(true)
				.addChoices(
					{ name: 'Dark Joke', value: 'dark' },
					{ name: 'Programming Joke', value: 'programming' },
					{ name: 'Miscellaneous Joke', value: 'miscellaneous' },
				),
		),
};

export const execute = async (interaction: CommandInteraction) => {
	const choice = interaction.options.getString('category')! as JokeCategories;

	const { category, joke } = await Jokes.getJokeByCategory(choice);

	await interaction.reply({
		embeds: [new MessageEmbed().setTitle(category).setDescription(joke).setColor('RANDOM')],
	});
};
