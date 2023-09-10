import { logger } from '@luferro/shared-utils';
import { createAudioResource } from 'discord-voip';
import { Readable } from 'stream';

import { Bot } from '../Bot';
import { bufferToInt16, getFrames } from './audio';

type Args = { client: Bot; pcm: Int16Array };

export const isOutOfVocabularyIntents = (intent: string) => ['music.play'].some((_intent) => _intent === intent);

export const infereIntent = async ({ client, pcm }: Args) => {
	const { speechToIntent } = client.tools;
	return new Promise((resolve) => {
		const silentFrames = bufferToInt16(Buffer.alloc(pcm.length, 0xffff));
		for (const _pcm of [silentFrames, pcm, silentFrames]) {
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

export const transcribe = async ({ client, pcm }: Args) => {
	const { speechToText } = client.tools;
	return new Promise((resolve) => {
		const { words, transcript } = speechToText.process(pcm);
		logger.debug(`Transcript: ${transcript}`);

		const slots: Record<string, string> = {
			query: words
				.map(({ word }) => word)
				.slice(1)
				.join(' '),
		};

		resolve({ slots, transcript });
	}) as Promise<{ slots: Record<string, string>; transcript: string }>;
};

export const synthesize = async ({ client, text }: Pick<Args, 'client'> & { text: string }) => {
	const [{ audioContent }] = await client.tools.textToSpeech.synthesizeSpeech({
		input: { text },
		voice: { name: 'en-US-Standard-J', languageCode: 'en-US', ssmlGender: 'MALE' },
		audioConfig: { audioEncoding: 'OGG_OPUS' },
	});
	if (!audioContent) throw new Error('Canno synthesize speech.');

	return createAudioResource(Readable.from(audioContent));
};
