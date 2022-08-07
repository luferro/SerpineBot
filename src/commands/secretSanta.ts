import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, User } from 'discord.js';
import { CommandName } from '../types/enums';

export const data = {
	name: CommandName.SecretSanta,
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.SecretSanta)
		.setDescription('Organizes a secret santa.')
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

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const mentions = interaction.options.getString('mentions', true).match(/\d+/g);
	const value = interaction.options.getInteger('value', true);

	if (!mentions) throw new Error('Invalid participant detected.');
	if (value < 5) throw new Error('Mininum value of 5€ required.');

	const uniqueMentions = new Set(mentions);
	if (uniqueMentions.size !== mentions.length) throw new Error('Duplicated participant detected.');

	const users = await Promise.all(
		mentions.map(async (id) => {
			if (!interaction.client.users.cache.has(id)) return;

			const user = await interaction.client.users.fetch(id);
			if (user.bot) return;

			return user;
		}),
	);
	const filteredUsers = users.filter((item): item is NonNullable<typeof item> => !!item);
	if (filteredUsers.length < 3) throw new Error('Minimum of 3 participants required.');

	const shuffledUsers = shuffle(filteredUsers);
	for (const [index, gifter] of shuffledUsers.entries()) {
		const receiver = shuffledUsers[index + 1] ?? shuffledUsers[0];

		const embed = new EmbedBuilder()
			.setTitle(`Secret Santa ${new Date().getFullYear()}`)
			.addFields([
				{
					name: '**Gifts exchange**',
					value: `**25/12/${new Date().getFullYear()}**`,
				},
				{
					name: '**Value**',
					value: `**${value}€** (Combination of multiple items is allowed.)`,
				},
				{
					name: '**Prepare a gift for**',
					value: `**${receiver.tag}**`,
				},
			])
			.setFooter({ text: 'Remember to update your wishlist. ' })
			.setColor('Random');

		gifter.send({ embeds: [embed] });
	}

	await interaction.reply({ content: 'A DM has been sent to each participant with more details.' });
};

const shuffle = (array: User[]) => {
	let currentIndex = array.length;
	while (currentIndex != 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
	return array;
};
