import { ConverterUtil } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('seek')
	.setDescription('Jump to a given minute.')
	.addStringOption((option) =>
		option.setName('timestamp').setDescription('Timestamp to jump to (e.g. 2:30).').setRequired(true),
	);

export const execute: CommandExecute = async ({ client, interaction }) => {
	const timestamp = interaction.options.getString('timestamp', true);

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot skip to timestamp.');

	const isValidTimestamp = /([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?/g.test(timestamp);
	if (!isValidTimestamp) throw new Error('Invalid timestamp format.');

	const duration = queue.currentTrack?.duration;
	if (!duration) throw new Error('Could not fetch track duration.');

	const seekMilliseconds = getMilliseconds(timestamp);
	const durationMilliseconds = getMilliseconds(duration);

	const isSeekValid = seekMilliseconds > 0 && seekMilliseconds < durationMilliseconds;
	if (!isSeekValid) throw new Error(`Seeking beyond limit. [0 - ${duration}]`);

	await queue.node.seek(seekMilliseconds);

	const embed = new EmbedBuilder().setTitle(`Playback jumped to timestamp \`${timestamp}\`.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

const getMilliseconds = (timestampToConvert: string) => {
	let totalMilliseconds = 0;
	timestampToConvert
		.split(':')
		.reverse()
		.forEach((time, index) => {
			if (index === 0) totalMilliseconds += ConverterUtil.toMilliseconds(Number(time), 'Seconds');
			if (index === 1) totalMilliseconds += ConverterUtil.toMilliseconds(Number(time), 'Minutes');
			if (index === 2) totalMilliseconds += ConverterUtil.toMilliseconds(Number(time), 'Hours');
		});

	return totalMilliseconds;
};
