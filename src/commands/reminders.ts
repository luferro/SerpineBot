import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as Reminders from '../services/reminders';
import { CommandName, TimeUnit } from '../types/enums';

export const data = {
	name: CommandName.Reminders,
	client: false,
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
				.addIntegerOption((option) =>
					option
						.setName('unit')
						.setDescription('Time unit.')
						.setRequired(true)
						.addChoices(
							{ name: 'Seconds', value: TimeUnit.Seconds },
							{ name: 'Minutes', value: TimeUnit.Minutes },
							{ name: 'Hours', value: TimeUnit.Hours },
							{ name: 'Days', value: TimeUnit.Days },
							{ name: 'Weeks', value: TimeUnit.Weeks },
							{ name: 'Months', value: TimeUnit.Months },
							{ name: 'Years', value: TimeUnit.Years },
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

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (interaction: ChatInputCommandInteraction) => Promise<void>> = {
		create: createReminder,
		delete: deleteReminder,
	};

	await select[subcommand](interaction);
};

const createReminder = async (interaction: ChatInputCommandInteraction) => {
	const time = interaction.options.getInteger('time', true);
	const unit = interaction.options.getInteger('unit', true) as TimeUnit;
	const message = interaction.options.getString('message', true);

	const { reminderId } = await Reminders.create(interaction.user.id, time, unit, message);

	const embed = new EmbedBuilder()
		.setTitle(`**Reminder Id:** ${reminderId}`)
		.setDescription(`${interaction.user}, I'll remind you about **${message}** in *${time} ${TimeUnit[unit]}*.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const deleteReminder = async (interaction: ChatInputCommandInteraction) => {
	const reminderId = interaction.options.getString('reminder', true);

	await Reminders.remove(reminderId);

	const embed = new EmbedBuilder().setTitle(`Reminder ${reminderId} has been deleted.`).setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};
