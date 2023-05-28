import { RemindersModel } from '@luferro/database';
import { ConverterUtil } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

type TimeUnit = Parameters<typeof ConverterUtil.toMilliseconds>[1];

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('create')
	.setDescription('Creates a reminder.')
	.addIntegerOption((option) => option.setName('time').setDescription('Time interval.').setRequired(true))
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
	.addStringOption((option) => option.setName('message').setDescription('Message.').setRequired(true));

export const execute: CommandExecute = async ({ interaction }) => {
	const time = interaction.options.getInteger('time', true);
	const unit = interaction.options.getString('unit', true) as Exclude<TimeUnit, 'Milliseconds'>;
	const message = interaction.options.getString('message', true);

	if (unit === 'Seconds' && time < 300) throw new Error('Minimum of 300 seconds required.');
	if (unit === 'Minutes' && time < 5) throw new Error('Minimum of 5 minutes required.');

	const reminderId = await RemindersModel.createReminder(
		interaction.user.id,
		Date.now(),
		Date.now() + ConverterUtil.toMilliseconds(time, unit),
		message,
	);

	const embed = new EmbedBuilder()
		.setTitle(`**Reminder Id:** ${reminderId}`)
		.setDescription(`${interaction.user}, I'll remind you about **${message}** in *${time} ${unit.toLowerCase()}*.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};
