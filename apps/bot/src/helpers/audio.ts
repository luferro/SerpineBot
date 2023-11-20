import { ArrayUtil, logger } from '@luferro/shared-utils';
import { EndBehaviorType, VoiceReceiver } from 'discord-voip';
import prism from 'prism-media';

import { Bot } from '../structures/Bot';

export const getAudioBuffer = async ({
	client,
	receiver,
	userId,
}: {
	client: Bot;
	receiver: VoiceReceiver;
	userId: string;
}) => {
	const { wake } = client.speech;
	if (!wake) {
		logger.warn('Porcupine user limit reached.');
		return Buffer.concat([]);
	}

	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		const stream = receiver.subscribe(userId, { end: { behavior: EndBehaviorType.AfterSilence, duration: 1000 } });

		const decodedStream = new prism.opus.Decoder({ rate: 16000, channels: 1, frameSize: 640 });
		stream.pipe(decodedStream);

		decodedStream.on('error', (error) => reject(error.message));
		decodedStream.on('data', (chunk) => chunks.push(chunk));
		decodedStream.on('end', () => {
			const buffer: Buffer[] = [];

			let keywordDetected = false;
			for (const frame of getFrames(bufferToInt16(Buffer.concat(chunks)), wake.frameLength)) {
				if (keywordDetected) buffer.push(Buffer.from(frame.buffer));
				else keywordDetected = wake.process(frame) !== -1;
			}

			resolve(Buffer.concat(buffer));
		});
	}) as Promise<Buffer>;
};

export const getFrames = (pcm: Int16Array, frameLength: number) => {
	const frames = ArrayUtil.splitIntoChunks(pcm as unknown as number[], frameLength);
	if (frames.at(-1)?.length !== frameLength) {
		frames.pop();
	}
	return frames as unknown as Int16Array[];
};

export const bufferToInt16 = (buffer: Buffer) => {
	const int16Array = new Array(buffer.length / 2);
	for (let i = 0; i < buffer.length; i += 2) {
		int16Array[i / 2] = buffer.readInt16LE(i);
	}
	return new Int16Array(int16Array);
};
