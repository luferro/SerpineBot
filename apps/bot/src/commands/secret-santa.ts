import { RemindersModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import { randomUUID } from 'crypto';
import { EmbedBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from 'discord.js';

import type { CommandData, CommandExecute } from '../types/bot';

export const data: CommandData = [
	new SlashCommandStringOption()
		.setName('mentions')
		.setDescription('Users @ participating in the Secret Santa.')
		.setRequired(true),
	new SlashCommandIntegerOption()
		.setName('value')
		.setDescription('Maximum value for the Secret Santa.')
		.setMinValue(5)
		.setRequired(true),
];

export const execute: CommandExecute = async ({ client, interaction }) => {
	const mentions = interaction.options.getString('mentions', true).match(/\d+/g);
	const value = interaction.options.getInteger('value', true);

	if (!mentions) throw new Error('Invalid participant detected.');

	const uniqueMentions = new Set(mentions);
	if (uniqueMentions.size !== mentions.length) throw new Error('Duplicated participant detected.');

	const users = await Promise.all(
		mentions
			.filter((id) => interaction.client.users.cache.has(id))
			.map(async (id) => {
				const user = await interaction.client.users.fetch(id);
				if (user.bot) throw new Error('Bots cannot participate in a Secret Santa.');
				return { participantId: randomUUID(), user };
			}),
	);
	if (users.length < 3) throw new Error('Minimum of 3 participants required.');

	const embed = new EmbedBuilder().setTitle('A DM will be sent to each participant shortly.').setColor('Random');
	await interaction.reply({ embeds: [embed] });

	const eventDate = getEventDate();
	const shuffledUsers = shuffle(users);
	for (const [index, gifter] of shuffledUsers.entries()) {
		const receiver = shuffledUsers[index + 1] ?? shuffledUsers[0];

		const reminderId = await RemindersModel.createReminder({
			userId: gifter.user.id,
			timeStart: Date.now(),
			timeEnd: eventDate.getTime(),
			message: `Secret Santa ${eventDate.getFullYear()}: It is time to exchange gifts. 🎅 Merry Christmas 🎅`,
		});

		const embed = new EmbedBuilder()
			.setTitle(`Secret Santa ${eventDate.getFullYear()}`)
			.addFields([
				{
					name: '**Gifts exchange**',
					value: `**${eventDate.toLocaleDateString(client.config.LOCALE)}**`,
				},
				{
					name: '**Value**',
					value: `**${value}€** (Combination of multiple items is allowed)`,
				},
				{
					name: '**Prepare a gift for**',
					value: `**${receiver.user.tag}**`,
				},
			])
			.setFooter({ text: `A reminder for the gifts exchange has been created. ReminderId: ${reminderId}` })
			.setColor('Random');

		gifter.user.send({ embeds: [embed] });
		logger.debug(JSON.stringify({ gifterId: gifter.participantId, receiverId: receiver.participantId }));
	}
};

const getEventDate = () => {
	const currentYear = new Date().getFullYear();
	const eventYear = new Date(currentYear, 11, 25).getTime() >= Date.now() ? currentYear : currentYear + 1;
	return new Date(eventYear, 11, 25);
};

const shuffle = <T>(array: T[]) => {
	let currentIndex = array.length;
	while (currentIndex != 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
	return array;
};
