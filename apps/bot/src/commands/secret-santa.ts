import { logger } from '@luferro/shared-utils';
import { randomUUID } from 'crypto';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import * as Reminders from '../services/reminders';
import type { CommandData, CommandExecute } from '../types/bot';
import { CommandName } from '../types/enums';

export const data: CommandData = {
	name: CommandName.SecretSanta,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.SecretSanta)
		.setDescription('Organizes a Secret Santa.')
		.addStringOption((option) =>
			option
				.setName('mentions')
				.setDescription('Mention users participating in this Secret Santa.')
				.setRequired(true),
		)
		.addIntegerOption((option) =>
			option
				.setName('value')
				.setDescription('Maximum value in euros to be used in this Secret Santa.')
				.setRequired(true),
		),
};

export const execute: CommandExecute = async ({ interaction }) => {
	const mentions = interaction.options.getString('mentions', true).match(/\d+/g);
	const value = interaction.options.getInteger('value', true);

	if (!mentions) throw new Error('Invalid participant detected.');
	if (value < 5) throw new Error('Mininum value of 5€ required.');

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
	const shuffledUsers = shuffle(users) as typeof users;
	for (const [index, gifter] of shuffledUsers.entries()) {
		const receiver = shuffledUsers[index + 1] ?? shuffledUsers[0];

		const reminderId = await Reminders.createReminder(
			gifter.user.id,
			eventDate.getTime() - Date.now(),
			'Milliseconds',
			`Secret Santa ${eventDate.getFullYear()}: It is time to exchange gifts. Merry Christmas 🎅`,
		);

		const embed = new EmbedBuilder()
			.setTitle(`Secret Santa ${eventDate.getFullYear()}`)
			.addFields([
				{
					name: '**Gifts exchange**',
					value: `**${eventDate.toLocaleDateString('pt-PT')}**`,
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
			.setFooter({ text: `Reminder for the gifts exchange has been created. ReminderId: ${reminderId}` })
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

const shuffle = (array: unknown[]) => {
	let currentIndex = array.length;
	while (currentIndex != 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
};
