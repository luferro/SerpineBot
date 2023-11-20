import { ArrayUtil, DateUtil, logger } from '@luferro/shared-utils';
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

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const mentions = interaction.options.getString(data[0].name, true).match(/\d+/g);
	const value = interaction.options.getInteger(data[1].name, true);

	if (!mentions) throw new Error(t('errors.secret-santa.mentions.invalid'));

	const uniqueMentions = new Set(mentions);
	if (uniqueMentions.size !== mentions.length) throw new Error(t('errors.secret-santa.mentions.duplicate'));

	const users = await Promise.all(
		mentions
			.filter((id) => client.users.cache.has(id))
			.map(async (id) => {
				const user = await client.users.fetch(id);
				if (user.bot) throw new Error(t('errors.secret-santa.mentions.bot'));
				return { participantId: randomUUID(), user };
			}),
	);
	if (users.length < 3) throw new Error(t('errors.secret-santa.mentions.minimum'));

	const embed = new EmbedBuilder().setTitle(t('interactions.secret-santa.embeds.0.title')).setColor('Random');
	await interaction.reply({ embeds: [embed] });

	const eventDate = getEventDate();
	const shuffledUsers = ArrayUtil.shuffle(users);
	for (const [index, gifter] of shuffledUsers.entries()) {
		const receiver = shuffledUsers[index + 1] ?? shuffledUsers[0];

		const reminder = await client.prisma.reminder.create({
			data: {
				userId: gifter.user.id,
				timeStart: new Date(),
				timeEnd: eventDate,
				message: t('interactions.secret-santa.reminder.message', { year: eventDate.getFullYear() }),
			},
		});

		const embed = new EmbedBuilder()
			.setTitle(t('interactions.secret-santa.embeds.1.title', { year: eventDate.getFullYear() }))
			.addFields([
				{
					name: t('interactions.secret-santa.embeds.1.fields.0.name'),
					value: DateUtil.format(eventDate),
				},
				{
					name: t('interactions.secret-santa.embeds.1.fields.1.name'),
					value: `${value}€`,
				},
				{
					name: t('interactions.secret-santa.embeds.1.fields.2.name'),
					value: receiver.user.username,
				},
			])
			.setFooter({ text: t('interactions.secret-santa.embeds.1.footer.text', { reminderId: reminder.id }) })
			.setColor('Random');

		await gifter.user.send({ embeds: [embed] });
		logger.debug({ gifterId: gifter.participantId, receiverId: receiver.participantId });
	}
};

const getEventDate = () => {
	const currentYear = new Date().getFullYear();
	const eventYear = new Date(currentYear, 11, 25).getTime() >= Date.now() ? currentYear : currentYear + 1;
	const date = new Date(eventYear, 11, 25);
	date.setHours(0, 0, 0, 0);
	return date;
};
