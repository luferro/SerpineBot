import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('create')
	.setDescription('Create a guild role.')
	.addStringOption((option) => option.setName('name').setDescription('Role name.').setRequired(true))
	.addStringOption((option) => option.setName('color').setDescription('Hexadecimal color.'))
	.addBooleanOption((option) => option.setName('hoist').setDescription('Appear in a separate category.'))
	.addBooleanOption((option) => option.setName('mentionable').setDescription('Can be mentioned by anyone.'));

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	const name = interaction.options.getString('name', true);
	const color = interaction.options.getString('color') as `#${string}` | null;
	const hoist = interaction.options.getBoolean('hoist');
	const mentionable = interaction.options.getBoolean('mentionable');

	const isValidHexColor = color && /^#(?:[0-9a-fA-F]{3}){1,2}$/g.test(color);
	if (!isValidHexColor) throw new Error('Invalid hexadecimal color.');

	await interaction.guild.roles.create({
		name,
		color: color ?? 'Default',
		hoist: Boolean(hoist),
		mentionable: Boolean(mentionable),
		position: interaction.guild.roles.cache.size + 1,
	});

	const embed = new EmbedBuilder().setTitle(`Role ${name} has been created.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
