import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ queue }) => {
	if (queue.isEmpty()) throw new Error('Cannot shuffle queue.');
	queue.tracks.shuffle();
};
