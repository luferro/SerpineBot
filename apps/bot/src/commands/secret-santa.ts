import type { CommandData } from '../types/bot';
import type { ExtendedChatInputCommandInteraction } from '../types/interaction';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { CommandName } from '../types/enums';
import { randomUUID } from 'crypto';
import { logger } from '@luferro/shared-utils';

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

export const execute = async (interaction: ExtendedChatInputCommandInteraction) => {
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

				return { randomId: randomUUID(), user };
			}),
	);
	if (users.length < 3) throw new Error('Minimum of 3 participants required.');

	const currentYear = new Date().getFullYear();
	const yearOfEvent = new Date(currentYear, 11, 25).getTime() >= Date.now() ? currentYear : currentYear + 1;

	const shuffledUsers = shuffle(users) as typeof users;
	for (const [index, gifter] of shuffledUsers.entries()) {
		const receiver = shuffledUsers[index + 1] ?? shuffledUsers[0];

		const embed = new EmbedBuilder()
			.setTitle(`Secret Santa ${yearOfEvent}`)
			.addFields([
				{
					name: '**Gifts exchange**',
					value: `**25/12/${yearOfEvent}**`,
				},
				{
					name: '**Value**',
					value: `**${value}€** (Combination of multiple items is allowed.)`,
				},
				{
					name: '**Prepare a gift for**',
					value: `**${receiver.user.tag}**`,
				},
			])
			.setFooter({ text: 'Remember to update your wishlist.' })
			.setColor('Random');

		gifter.user.send({ embeds: [embed] });
		logger.debug(JSON.stringify({ gifterId: gifter.randomId, receiverId: receiver.randomId }));
	}

	await interaction.reply({ content: 'A DM has been sent to each participant with more details.' });
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
