import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ queue }) => {
	if (queue.history.isEmpty()) throw new Error('There is no previous track.');
	queue.history.previous();
};
