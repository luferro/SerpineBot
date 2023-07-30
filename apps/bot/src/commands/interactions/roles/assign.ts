import { EmbedBuilder, Role, SlashCommandSubcommandBuilder } from 'discord.js';

import type { InteractionCommandExecute, InteractionCommandData } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('assign')
	.setDescription('Assign a role to a guild member.')
	.addUserOption((option) => option.setName('user').setDescription('Guild user.').setRequired(true))
	.addRoleOption((option) => option.setName('role').setDescription('Guild role.').setRequired(true));

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	const user = interaction.options.getUser('user', true);
	const role = interaction.options.getRole('role', true) as Role;

	const member = interaction.guild.members.cache.find(({ id }) => id === user.id)!;
	if (member.roles.cache.has(role.id)) throw new Error(`${member.user.username} already has role ${role.name}.`);
	await member.roles.add(role);

	const embed = new EmbedBuilder()
		.setTitle(`Role ${role.name} has been added to ${user.username}.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};
