import type { CommandData } from '../types/bot';
import type { ExtendedChatInputCommandInteraction } from '../types/interaction';
import type { TimeUnit } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as Reminders from '../services/reminders';
import { CommandName } from '../types/enums';

export const data: CommandData = {
	name: CommandName.Reminders,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Reminders)
		.setDescription('Reminder related commands.')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Creates a reminder.')
				.addIntegerOption((option) =>
					option
						.setName('time')
						.setDescription('Time interval until you are reminded of your message.')
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName('unit')
						.setDescription('Time unit.')
						.setRequired(true)
						.addChoices(
							{ name: 'Seconds', value: 'Seconds' },
							{ name: 'Minutes', value: 'Minutes' },
							{ name: 'Hours', value: 'Hours' },
							{ name: 'Days', value: 'Days' },
							{ name: 'Weeks', value: 'Weeks' },
							{ name: 'Months', value: 'Months' },
							{ name: 'Years', value: 'Years' },
						),
				)
				.addStringOption((option) =>
					option.setName('message').setDescription('Reminder message.').setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('delete')
				.setDescription('Delete a reminder.')
				.addStringOption((option) =>
					option.setName('id').setDescription('Id of the reminder to be deleted.').setRequired(true),
				),
		),
};

export const execute = async (interaction: ExtendedChatInputCommandInteraction) => {
	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (arg0: typeof interaction) => Promise<void>> = {
		create: createReminder,
		delete: deleteReminder,
	};

	await select[subcommand](interaction);
};

const createReminder = async (interaction: ExtendedChatInputCommandInteraction) => {
	const time = interaction.options.getInteger('time', true);
	const unit = interaction.options.getString('unit', true) as Exclude<TimeUnit, 'Milliseconds'>;
	const message = interaction.options.getString('message', true);

	const { reminderId } = await Reminders.create(interaction.user.id, time, unit, message);

	const embed = new EmbedBuilder()
		.setTitle(`**Reminder Id:** ${reminderId}`)
		.setDescription(`${interaction.user}, I'll remind you about **${message}** in *${time} ${unit.toLowerCase()}*.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const deleteReminder = async (interaction: ExtendedChatInputCommandInteraction) => {
	const reminderId = interaction.options.getString('reminder', true);

	await Reminders.remove(reminderId);
	const embed = new EmbedBuilder().setTitle(`Reminder ${reminderId} has been deleted.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
