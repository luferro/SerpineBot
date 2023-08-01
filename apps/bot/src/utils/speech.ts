import { createAudioResource } from '@discordjs/voice';
import { logger } from '@luferro/shared-utils';
import { Readable } from 'stream';

import { Bot } from '../Bot';
import { bufferToInt16, getFrames } from './audio';

type Args = { client: Bot; pcm: Int16Array };

export const infereIntent = async ({ client, pcm }: Args) => {
	const { speechToIntent } = client.tools;
	return new Promise((resolve) => {
		const silentFrames = bufferToInt16(Buffer.alloc(pcm.length / 2, 0xffff));

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
	// const { speechToText } = client.tools;
	// return new Promise((resolve) => {
	// 	const { words: sttWords, transcript } = speechToText.process(pcm);
	// 	const words = sttWords.map(({ word }) => word);
	// 	logger.debug(`Transcript: ${transcript}`);
	// 	const intents: Record<string, string> = {
	// 		play: 'music.play',
	// 	};
	// 	const action = words.shift();
	// 	const intent = action ? intents[action] : null;
	// 	const slots: Record<string, string> = { query: words.join(' ') };
	// 	if (intent) resolve({ intent, slots, transcript });
	// 	else resolve(null);
	// }) as Promise<{ intent: string; slots: Record<string, string>; transcript: string } | null>;

	const [{ results, totalBilledTime }] = await client.tools.speechToText.recognize({
		audio: { content: new Uint8Array(pcm.buffer) },
		config: { encoding: 'LINEAR16', sampleRateHertz: 16000, languageCode: 'en-US' },
	});
	logger.debug(`Billed time: ${totalBilledTime?.seconds} seconds`);
	const result = results?.[0].alternatives?.[0];
	if (!result) return;

	const transcript = result.transcript!;
	const words = transcript.split(' ');

	const intents: Record<string, string> = {
		play: 'music.play',
	};

	const intent = intents[words.shift()!];
	const slots: Record<string, string> = { query: words.join() };

	return { intent, slots, transcript };
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
