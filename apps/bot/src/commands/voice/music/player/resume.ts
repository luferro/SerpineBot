import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ queue }) => {
	if (!queue.currentTrack) throw new Error('No track is playing.');
	queue.node.resume();
};
