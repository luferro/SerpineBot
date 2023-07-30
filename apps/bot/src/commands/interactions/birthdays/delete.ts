import { BirthdaysModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('delete')
	.setDescription('Delete your birthday entry.');

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	await BirthdaysModel.deleteBirthdayById({ userId: interaction.user.id });
	const embed = new EmbedBuilder().setTitle('Your birthday has been deleted.').setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};