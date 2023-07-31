import { EmbedBuilder } from 'discord.js';

import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ queue, slots }) => {
	if (!queue.currentTrack) throw new Error('Nothing is playing.');
	if (queue.isEmpty()) throw new Error('Queue is empty');

	const position = Number(slots['position']);

	const currentTrack = queue.currentTrack;
	const nextTrack = queue.tracks.at(position ? position - 1 : 0);

	const isSuccessful = position ? queue.node.skipTo(position - 1) : queue.node.skip();
	if (!isSuccessful) throw new Error(`No track found in position \`${position}\`.`);

	const embed = new EmbedBuilder()
		.setTitle(`Skipped \`${currentTrack}\`.`)
		.setDescription(`Now playing \`${nextTrack}\`.`)
		.setColor('Random');

	await queue.metadata.send({ embeds: [embed] });
};
