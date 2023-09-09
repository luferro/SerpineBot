import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ queue, slots }) => {
	if (queue.isEmpty()) throw new Error(t('errors.player.queue.empty'));

	const position = Number(slots['position']);
	const removedTrack = queue.node.remove(position - 1);
	if (!removedTrack) throw new Error(t('errors.player.queue.tracks.position', { position: `\`${position}\`` }));

	const embed = new EmbedBuilder()
		.setTitle(
			t('music.queue.remove.embeds.2.title', { title: `\`${removedTrack.title}\``, position: `**${position}**` }),
		)
		.setColor('Random');
	queue.metadata.send({ embeds: [embed] });
};
