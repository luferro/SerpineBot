import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ queue, slots }) => {
	const position = Number(slots['position']);

	const nextTrack = queue.tracks.at(position - 1);
	if (!nextTrack) throw new Error(t('errors.player.queue.tracks.position', { position: `\`${position}\`` }));

	queue.node.jump(nextTrack);

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.music.player.jump.embed.title', { track: `\`${nextTrack}\`` }))
		.setColor('Random');
	await queue.metadata.send({ embeds: [embed] });
};
