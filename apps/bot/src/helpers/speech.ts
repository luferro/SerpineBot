import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { logger } from '@luferro/shared-utils';
import { Leopard } from '@picovoice/leopard-node';
import { BuiltinKeyword, Porcupine } from '@picovoice/porcupine-node';
import { Rhino } from '@picovoice/rhino-node';
import { createAudioResource } from 'discord-voip';
import { resolve } from 'path';
import { Readable } from 'stream';

import { Bot } from '../structures/Bot';
import { bufferToInt16, getFrames } from './audio';

type SpeechClient = { apiKey: string };
type Intent = { intent: string };
type Audio = { pcm: Int16Array };
type Text = { text: string };

export const initializeTextToSpeech = () => new TextToSpeechClient();

export const initializePorcupine = ({ apiKey }: SpeechClient) => {
	const keywords = [`${resolve('models/porcupine')}/wakeword_en_${process.platform}.ppn`, BuiltinKeyword.BUMBLEBEE];
	try {
		return new Porcupine(apiKey, keywords, [0.8, 0.5]);
	} catch (error) {
		return null;
	}
};

export const initializeRhino = ({ apiKey }: SpeechClient) => {
	const model = `${resolve('models/rhino')}/model_en_${process.platform}.rhn`;
	try {
		return new Rhino(apiKey, model, 0.5, 0.5, false);
	} catch (error) {
		return null;
	}
};

export const initializeLeopard = ({ apiKey }: SpeechClient) => {
	const model = `${resolve('models/leopard')}/model_en.pv`;
	try {
		return new Leopard(apiKey, { modelPath: model });
	} catch (error) {
		return null;
	}
};

export const isOutOfVocabularyIntents = ({ intent }: Intent) => ['music.play'].some((_intent) => _intent === intent);

export const infereIntent = async ({ client, pcm }: { client: Bot } & Audio) => {
	const { sti } = client.speech;
	if (!sti) {
		logger.warn('Rhino user limit reached.');
		return null;
	}

	return new Promise((resolve) => {
		const silentFrames = bufferToInt16(Buffer.alloc(pcm.length, 0xffff));
		for (const _pcm of [silentFrames, pcm, silentFrames]) {
			let intentDetected = false;
			for (const frame of getFrames(_pcm, sti.frameLength)) {
				intentDetected = sti.process(frame);
				if (!intentDetected) continue;

				const { isUnderstood, intent, slots } = sti.getInference();
				if (isUnderstood) resolve({ intent: intent!, slots: slots! });
				else resolve(null);
			}
		}

		resolve(null);
	}) as Promise<{ intent: string; slots: Record<string, string> } | null>;
};

export const transcribe = async ({ client, pcm }: { client: Bot } & Audio) => {
	const { stt } = client.speech;
	if (!stt) {
		logger.warn('Leopard user limit reached.');
		return null;
	}

	return new Promise((resolve) => {
		const { words, transcript } = stt.process(pcm);
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

export const synthesize = async ({ client, text }: { client: Bot } & Text) => {
	const [{ audioContent }] = await client.speech.tts.synthesizeSpeech({
		input: { text },
		voice: { name: 'en-US-Standard-J', languageCode: 'en-US', ssmlGender: 'MALE' },
		audioConfig: { audioEncoding: 'OGG_OPUS' },
	});
	if (!audioContent) throw new Error('Cannot synthesize speech.');

	return createAudioResource(Readable.from(audioContent));
};
