import { logger } from '@luferro/shared-utils';

import { Bot } from '../Bot';
import { bufferToInt16, getFrames } from './audio';

type SpeechArgs = { client: Bot; pcm: Int16Array };

export const infereIntent = async ({ client, pcm }: SpeechArgs) => {
	const { speechToIntent } = client.tools;
	return new Promise((resolve) => {
		for (const _pcm of [pcm, bufferToInt16(Buffer.alloc(2 * pcm.length, 0xffff))]) {
			let intentDetected = false;
			for (const frame of getFrames(_pcm, speechToIntent.frameLength)) {
				intentDetected = speechToIntent.process(frame);
				if (!intentDetected) continue;

				const { isUnderstood, intent, slots } = speechToIntent.getInference();
				if (isUnderstood) resolve({ intent: intent!, slots: slots! });
				else resolve(null);
			}
		}

		resolve(null);
	}) as Promise<{ intent: string; slots: Record<string, string> } | null>;
};

export const transcribe = async ({ client, pcm }: SpeechArgs) => {
	const { speechToText } = client.tools;
	return new Promise((resolve) => {
		const { words: sttWords, transcript } = speechToText.process(pcm);
		const words = sttWords.map(({ word }) => word);
		logger.debug(`Transcript: ${transcript}`);

		const intents: Record<string, string> = {
			play: 'music.play',
		};

		const action = words.shift();
		const intent = action ? intents[action] : null;
		const slots: Record<string, string> = { query: words.join(' ') };

		if (intent) resolve({ intent, slots, transcript });
		else resolve(null);
	}) as Promise<{ intent: string; slots: Record<string, string>; transcript: string } | null>;
};