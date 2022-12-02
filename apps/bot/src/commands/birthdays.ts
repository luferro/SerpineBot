import type { ExtendedChatInputCommandInteraction } from '../types/interaction';
import type { CommandData } from '../types/bot';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as Birthdays from '../services/birthdays';
import { CommandName } from '../types/enums';

export const data: CommandData = {
	name: CommandName.Birthdays,
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
		.addSubcommand((subcommand) => subcommand.setName('delete').setDescription('Delete your birthday entry.')),
};

export const execute = async (interaction: ExtendedChatInputCommandInteraction) => {
	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (arg0: typeof interaction) => Promise<void>> = {
		create: createBirthday,
		list: getBirthdays,
		delete: deleteBirthday,
	};

	await select[subcommand](interaction);
};

const createBirthday = async (interaction: ExtendedChatInputCommandInteraction) => {
	const day = interaction.options.getInteger('day', true);
	const month = interaction.options.getInteger('month', true);
	const year = interaction.options.getInteger('year', true);

	await Birthdays.create(interaction.user.id, `${year}-${month}-${day}`);
	const embed = new EmbedBuilder().setTitle(`Your birthday has been registered.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const getBirthdays = async (interaction: ExtendedChatInputCommandInteraction) => {
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

const deleteBirthday = async (interaction: ExtendedChatInputCommandInteraction) => {
	await Birthdays.remove(interaction.user.id);
	const embed = new EmbedBuilder().setTitle('Your birthday has been deleted.').setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
