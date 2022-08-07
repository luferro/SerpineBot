import { ChatInputCommandInteraction, EmbedBuilder, Message, SlashCommandBuilder } from 'discord.js';
import { CommandName, PollOptions } from '../types/enums';
import * as StringUtil from '../utils/string';

export const data = {
	name: CommandName.Poll,
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Poll)
		.setDescription('Creates a poll with reactions.')
		.addStringOption((option) => option.setName('question').setDescription('Poll question.').setRequired(true))
		.addStringOption((option) =>
			option
				.setName('options')
				.setDescription('Poll options must be separated by a comma, semi-colon or the "or" keyword.'),
		),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const question = interaction.options.getString('question', true);
	const options = interaction.options.getString('options');

	if (options) {
		const choices = options.split(/or|,|;/);
		if (choices.length < 2 || choices.length > 10)
			throw new Error('Invalid quantity. Choose between 2 and 10 options.');

		const reactions: string[] = [];
		const formattedChoices = choices
			.map((choice, index) => {
				reactions.push(PollOptions[index + 1]);
				return `> ${PollOptions[index + 1]} **${choice.split(' ').map(StringUtil.capitalize).join(' ')}**`;
			})
			.join('\n');

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.capitalize(question))
			.setDescription(formattedChoices)
			.setColor('Random');

		const message = await interaction.reply({ embeds: [embed], fetchReply: true });
		return addReactions(message, reactions);
	}

	const embed = new EmbedBuilder()
		.setTitle(StringUtil.capitalize(question))
		.setDescription('Vote with 👍🏻 or 👎🏻')
		.setColor('Random');

	const message = await interaction.reply({ embeds: [embed], fetchReply: true });
	addReactions(message, ['👍🏻', '👎🏻']);
};

const addReactions = (message: Message, reactions: string[]) => {
	message.react(reactions[0]);
	reactions.shift();
	if (reactions.length > 0) setTimeout(() => addReactions(message, reactions), 750);
};
