import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, MessageEmbed } from 'discord.js';
import * as StringUtil from '../utils/string';

export const data = {
	name: 'poll',
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('Creates a poll with reactions.')
		.addStringOption((option) => option.setName('question').setDescription('Poll question.').setRequired(true))
		.addStringOption((option) =>
			option.setName('options').setDescription('Poll options. Options must be separated by a delimiter.'),
		),
};

export const execute = async (interaction: CommandInteraction) => {
	const question = interaction.options.getString('question')!;
	const options = interaction.options.getString('options');

	const pollOptions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

	if (options) {
		const choices = options.split(/or|,|;/);
		if (choices.length <= 1 || choices.length > 10)
			return await interaction.reply({
				content: 'Poll allows a minimum of 2 options and a maximum of 10 options.',
				ephemeral: true,
			});

		const reactions: string[] = [];
		const list = choices.map((item, index) => {
			reactions.push(pollOptions[index]);
			return `> ${pollOptions[index]} **${item.split(' ').map(StringUtil.capitalize).join(' ')}**`;
		});

		const message = (await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setTitle(StringUtil.capitalize(question))
					.setDescription(list.join('\n'))
					.setColor('RANDOM'),
			],
			fetchReply: true,
		})) as Message;
		return addReactions(message, reactions);
	}

	const message = (await interaction.reply({
		embeds: [
			new MessageEmbed().setTitle(StringUtil.capitalize(question)).setDescription('👍🏻 or 👎🏻').setColor('RANDOM'),
		],
		fetchReply: true,
	})) as Message;
	addReactions(message, ['👍🏻', '👎🏻']);
};

const addReactions = (message: Message, reactions: string[]) => {
	message.react(reactions[0]);
	reactions.shift();
	if (reactions.length > 0) setTimeout(() => addReactions(message, reactions), 750);
};
