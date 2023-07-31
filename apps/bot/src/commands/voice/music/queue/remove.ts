import { EmbedBuilder } from 'discord.js';

import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ queue, slots }) => {
	if (!queue.currentTrack) throw new Error('Cannot remove track.');

	const position = Number(slots['position']);
	const removedTrack = queue.node.remove(position - 1);
	if (!removedTrack) throw new Error(`No track found in position \`${position}\`.`);

	const embed = new EmbedBuilder().setTitle(`Track \`${removedTrack.title}\` removed.`).setColor('Random');
	queue.metadata.send({ embeds: [embed] });
};
