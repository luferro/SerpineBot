import { RemindersModel } from '@luferro/database';
import { DateUtil, logger } from '@luferro/shared-utils';
import { randomUUID } from 'crypto';
import { EmbedBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../types/bot';

export const data: InteractionCommandData = [
	new SlashCommandStringOption()
		.setName(t('interactions.secret-santa.options.0.name'))
		.setDescription(t('interactions.secret-santa.options.0.description'))
		.setRequired(true),
	new SlashCommandIntegerOption()
		.setName(t('interactions.secret-santa.options.1.name'))
		.setDescription(t('interactions.secret-santa.options.1.description'))
		.setMinValue(5)
		.setRequired(true),
];

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	const mentions = interaction.options.getString(t('interactions.secret-santa.options.0.name'), true).match(/\d+/g);
	const value = interaction.options.getInteger(t('interactions.secret-santa.options.1.name'), true);

	if (!mentions) throw new Error(t('errors.secret-santa.users.invalid'));

	const uniqueMentions = new Set(mentions);
	if (uniqueMentions.size !== mentions.length) throw new Error(t('errors.secret-santa.users.duplicate'));

	const users = await Promise.all(
		mentions
			.filter((id) => interaction.client.users.cache.has(id))
			.map(async (id) => {
				const user = await interaction.client.users.fetch(id);
				if (user.bot) throw new Error(t('errors.secret-santa.users.bot'));
				return { participantId: randomUUID(), user };
			}),
	);
	if (users.length < 3) throw new Error(t('errors.secret-santa.users.minimum'));

	const embed = new EmbedBuilder().setTitle(t('interactions.secret-santa.embeds.0.title')).setColor('Random');
	await interaction.reply({ embeds: [embed] });

	const eventDate = getEventDate();
	const shuffledUsers = shuffle(users);
	for (const [index, gifter] of shuffledUsers.entries()) {
		const receiver = shuffledUsers[index + 1] ?? shuffledUsers[0];

		const reminderId = await RemindersModel.createReminder({
			userId: gifter.user.id,
			timeStart: Date.now(),
			timeEnd: eventDate.getTime(),
			message: t('interactions.secret-santa.reminder.message', { year: eventDate.getFullYear() }),
		});

		const embed = new EmbedBuilder()
			.setTitle(t('interactions.secret-santa.embeds.1.title', { year: eventDate.getFullYear() }))
			.addFields([
				{
					name: `**${t('interactions.secret-santa.embeds.1.fields.0.name')}**`,
					value: `**${DateUtil.formatDate(eventDate)}**`,
				},
				{
					name: `**${t('interactions.secret-santa.embeds.1.fields.1.name')}**`,
					value: `**${value}€**`,
				},
				{
					name: `**${t('interactions.secret-santa.embeds.1.fields.2.name')}**`,
					value: `**${receiver.user.username}**`,
				},
			])
			.setFooter({ text: t('interactions.secret-santa.embeds.1.footer.text', { reminderId }) })
			.setColor('Random');

		gifter.user.send({ embeds: [embed] });
		logger.debug({ gifterId: gifter.participantId, receiverId: receiver.participantId });
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
