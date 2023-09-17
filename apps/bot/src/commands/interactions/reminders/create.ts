import { RemindersModel } from '@luferro/database';
import { ConverterUtil } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

type TimeUnit = Parameters<typeof ConverterUtil.toMilliseconds>[1];

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.reminders.create.name'))
	.setDescription(t('interactions.reminders.create.description'))
	.addIntegerOption((option) =>
		option
			.setName(t('interactions.reminders.create.options.0.name'))
			.setDescription(t('interactions.reminders.create.options.0.description'))
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName(t('interactions.reminders.create.options.1.name'))
			.setDescription(t('interactions.reminders.create.options.1.description'))
			.setRequired(true)
			.addChoices(
				...Array.from({ length: 7 }).map((_, index) => ({
					name: t(`interactions.reminders.create.options.1.choices.${index}.name`),
					value: t(`interactions.reminders.create.options.1.choices.${index}.name`),
				})),
			),
	)
	.addStringOption((option) =>
		option
			.setName(t('interactions.reminders.create.options.2.name'))
			.setDescription(t('interactions.reminders.create.options.2.description'))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	const time = interaction.options.getInteger(t('interactions.reminders.create.options.0.name'), true);
	const unit = interaction.options.getString(t('interactions.reminders.create.options.1.name'), true) as TimeUnit;
	const message = interaction.options.getString(t('interactions.reminders.create.options.2.name'), true);

	if (unit === 'Seconds' && time < 300) throw new Error(t('interactions.reminders.minimum.seconds'));
	if (unit === 'Minutes' && time < 5) throw new Error(t('interactions.reminders.minimum.minutes'));

	const user = interaction.user;
	const reminderId = await RemindersModel.createReminder({
		userId: user.id,
		timeStart: Date.now(),
		timeEnd: Date.now() + ConverterUtil.toMilliseconds(time, unit),
		message,
	});

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.reminders.create.embed.title', { reminderId: `**${reminderId}**` }))
		.setDescription(
			t('interactions.reminders.create.embed.description', {
				user,
				message,
				time,
				unit: unit.toLocaleLowerCase(),
			}),
		)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};
