import { BirthdaysModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.birthdays.delete.name'))
	.setDescription(t('interactions.birthdays.delete.description'));

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	await BirthdaysModel.deleteBirthdayById({ userId: interaction.user.id });
	const embed = new EmbedBuilder().setTitle(t('interactions.birthdays.delete.embed.title')).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
