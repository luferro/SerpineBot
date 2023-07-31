import { EmbedBuilder } from 'discord.js';

import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ queue, slots }) => {
	const position = Number(slots['position']);

	const nextTrack = queue.tracks.at(position - 1);
	if (!nextTrack) throw new Error(`No track found in position \`${position}\`.`);

	queue.node.jump(nextTrack);

	const embed = new EmbedBuilder().setTitle(`Jumped to \`${nextTrack}\`.`).setColor('Random');
	await queue.metadata.send({ embeds: [embed] });
};
