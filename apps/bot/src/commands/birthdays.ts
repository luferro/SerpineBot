import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as Birthdays from '../services/birthdays';
import { CommandName } from '../types/enums';

export const data = {
	name: CommandName.Birthdays,
	isClientRequired: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Birthdays)
		.setDescription('Birthday related commands.')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Register your birthday.')
				.addIntegerOption((option) =>
					option.setName('day').setDescription('Day of your birthday.').setRequired(true),
				)
				.addIntegerOption((option) =>
					option.setName('month').setDescription('Month of your birthday.').setRequired(true),
				)
				.addIntegerOption((option) =>
					option.setName('year').setDescription('Year of your birthday.').setRequired(true),
				),
		)
		.addSubcommand((subcommand) => subcommand.setName('list').setDescription('Returns a list of birthdays.'))
		.addSubcommand((subcommand) => subcommand.setName('delete').setDescription('Delete your birthday.')),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (arg0: ChatInputCommandInteraction) => Promise<void>> = {
		create: createBirthday,
		list: getBirthdays,
		delete: deleteBirthday,
	};

	await select[subcommand](interaction);
};

const createBirthday = async (interaction: ChatInputCommandInteraction) => {
	const day = interaction.options.getInteger('day', true);
	const month = interaction.options.getInteger('month', true);
	const year = interaction.options.getInteger('year', true);

	const date = `${year}-${month}-${day}`;

	await Birthdays.create(interaction.user.id, date);

	const embed = new EmbedBuilder().setTitle(`Your birthday has been registered.`).setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const getBirthdays = async (interaction: ChatInputCommandInteraction) => {
	const birthdays = await Birthdays.getBirthdays(interaction.client);
	if (birthdays.length === 0) throw new Error('No birthdays have been registered.');

	const sortedBirthdays = birthdays.sort((a, b) => {
		const date = new Date();
		const { 0: firstDateDay, 1: firstDateMonth } = a.birthday.split('/');
		const { 0: secondDateDay, 1: secondDateMonth } = b.birthday.split('/');

		const firstDate = new Date(date.getFullYear(), Number(firstDateMonth) - 1, Number(firstDateDay));
		const secondDate = new Date(date.getFullYear(), Number(secondDateMonth) - 1, Number(secondDateDay));

		return firstDate.getTime() - secondDate.getTime();
	});
	const formattedBirthday = sortedBirthdays.map(({ birthday, user }) => `> **${birthday}** ${user.tag}`).join('\n');

	const embed = new EmbedBuilder().setTitle('Birthdays').setDescription(formattedBirthday).setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const deleteBirthday = async (interaction: ChatInputCommandInteraction) => {
	await Birthdays.remove(interaction.user.id);

	const embed = new EmbedBuilder().setTitle(`Your birthday has been deleted.`).setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};