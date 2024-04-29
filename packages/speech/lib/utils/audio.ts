import { splitIntoChunks } from "@luferro/helpers/transform";

export const getFrames = (pcm: Int16Array, frameLength: number) => {
	const frames = splitIntoChunks(pcm as unknown as number[], frameLength);
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
