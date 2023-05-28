import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { QueueRepeatMode } from 'discord-player';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('loop')
	.setDescription('Sets a loop mode for the current track.')
	.addIntegerOption((option) =>
		option
			.setName('mode')
			.setDescription('Loop mode.')
			.setRequired(true)
			.addChoices(
				{ name: 'Off', value: QueueRepeatMode.OFF },
				{ name: 'Track', value: QueueRepeatMode.TRACK },
				{ name: 'Queue', value: QueueRepeatMode.QUEUE },
				{ name: 'Autoplay', value: QueueRepeatMode.AUTOPLAY },
			),
	);

export const execute: CommandExecute = async ({ client, interaction }) => {
	const mode = interaction.options.getInteger('mode', true) as QueueRepeatMode;

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot toggle loop.');

	queue.setRepeatMode(mode);

	const embed = new EmbedBuilder().setTitle(`Loop mode set to ${QueueRepeatMode[mode]}`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};
