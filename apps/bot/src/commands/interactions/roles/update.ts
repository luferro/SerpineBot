import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { InteractionCommandExecute, InteractionCommandData } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('update')
	.setDescription('Update a guild role.')
	.addRoleOption((option) => option.setName('role').setDescription('Guild role.').setRequired(true))
	.addStringOption((option) => option.setName('name').setDescription('New role name.'))
	.addStringOption((option) => option.setName('color').setDescription('Hexadecimal color.'))
	.addBooleanOption((option) => option.setName('hoist').setDescription('Appear in a separate category.'))
	.addBooleanOption((option) => option.setName('mentionable').setDescription('Can be mentioned by anyone.'))
	.addIntegerOption((option) => option.setName('position').setDescription('Position in the role manager.'));

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	const role = interaction.options.getRole('role', true);
	const name = interaction.options.getString('name');
	const color = interaction.options.getString('color') as `#${string}` | null;
	const hoist = interaction.options.getBoolean('hoist');
	const mentionable = interaction.options.getBoolean('mentionable');
	const position = interaction.options.getInteger('position');

	const isValidHexColor = color && /^#(?:[0-9a-fA-F]{3}){1,2}$/g.test(color);
	if (!isValidHexColor) throw new Error('Invalid hexadecimal color.');

	await interaction.guild.roles.edit(role.id, {
		name: name ?? role.name,
		color: color ?? role.color,
		hoist: hoist ?? role.hoist,
		mentionable: mentionable ?? role.mentionable,
		position: position ?? role.position,
	});

	const embed = new EmbedBuilder().setTitle(`Role ${name} has been updated.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
