import { EmbedBuilder, Role, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('delete')
	.setDescription('Delete a guild role.')
	.addRoleOption((option) => option.setName('role').setDescription('Guild role.').setRequired(true));

export const execute: CommandExecute = async ({ interaction }) => {
	const role = interaction.options.getRole('role', true) as Role;

	await role.delete();

	const embed = new EmbedBuilder().setTitle(`Role ${role.name} has been deleted.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
