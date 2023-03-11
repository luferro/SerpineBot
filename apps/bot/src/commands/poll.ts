import { StringUtil } from '@luferro/shared-utils';
import type { Message } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../types/bot';
import { CommandName } from '../types/enums';
import type { ExtendedChatInputCommandInteraction } from '../types/interaction';

enum PollOptions {
	'1️⃣' = 1,
	'2️⃣',
	'3️⃣',
	'4️⃣',
	'5️⃣',
	'6️⃣',
	'7️⃣',
	'8️⃣',
	'9️⃣',
	'🔟',
}

export const data: CommandData = {
	name: CommandName.Poll,
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

export const execute: CommandExecute = async ({ interaction }) => {
	const question = interaction.options.getString('question', true);
	const options = interaction.options.getString('options');

	if (options) await handlePollWithOptions(interaction, question, options);
	else await handlePollWithoutOptions(interaction, question);
};

const handlePollWithoutOptions = async (interaction: ExtendedChatInputCommandInteraction, question: string) => {
	const embed = new EmbedBuilder()
		.setTitle(StringUtil.capitalize(question))
		.setDescription('Vote with 👍🏻 or 👎🏻')
		.setColor('Random');

	const message = await interaction.reply({ embeds: [embed], fetchReply: true });
	addReactions(message, ['👍🏻', '👎🏻']);
};

const handlePollWithOptions = async (
	interaction: ExtendedChatInputCommandInteraction,
	question: string,
	options: string,
) => {
	const choices = options.split(/or|,|;/);
	if (choices.length < 2 || choices.length > 10) throw new Error('Invalid poll. Choose between 2 and 10 options.');

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
	addReactions(message, reactions);
};

const addReactions = (message: Message, reactions: string[]) => {
	message.react(reactions[0]);
	reactions.shift();
	if (reactions.length > 0) setTimeout(() => addReactions(message, reactions), 750);
};
