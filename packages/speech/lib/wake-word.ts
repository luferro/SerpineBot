import type { Readable } from "node:stream";
import { LoggerUtil } from "@luferro/shared-utils";
import { BuiltinKeyword, Porcupine, PorcupineErrors, getInt16Frames } from "@picovoice/porcupine-node";
import prism from "prism-media";

type Options = {
	/**
	 * Built-in keywords
	 * @default "BUMBLEBEE"
	 */
	standardKeywords?: (keyof typeof BuiltinKeyword)[];
	/**
	 * Paths to custom keyword models
	 */
	customKeywords?: string[];
};

export class WakeWordClient {
	private logger: LoggerUtil.Logger;
	private porcupine?: Porcupine;

	constructor(apiKey: string, { standardKeywords = ["BUMBLEBEE"], customKeywords = [] }: Options = {}) {
		this.logger = LoggerUtil.configureLogger();
		try {
			const keywords = [...standardKeywords.map((keyword) => BuiltinKeyword[keyword]), ...customKeywords];
			const sensitivities = keywords.map((keyword) => (this.isBuiltInKeyword(keyword) ? 0.5 : 0.8));
			this.porcupine = new Porcupine(apiKey, keywords, sensitivities);
		} catch (error) {
			const isLimitReachedError = error instanceof PorcupineErrors.PorcupineActivationLimitReachedError;
			if (isLimitReachedError) this.logger.warn("Porcupine | User limit reached");
			else throw error;
		}
	}

	private isBuiltInKeyword(keyword: string): keyword is BuiltinKeyword {
		return Object.values(BuiltinKeyword).includes(keyword as BuiltinKeyword);
	}

	detect(stream: Readable) {
		const porcupine = this.porcupine;
		if (!porcupine) return Promise.resolve(Buffer.concat([]));

		return new Promise<Buffer>((resolve, reject) => {
			const chunks: Buffer[] = [];

			const decodedStream = new prism.opus.Decoder({ rate: 16000, channels: 1, frameSize: 640 });
			stream.pipe(decodedStream);

			decodedStream.on("error", (error) => reject(error.message));
			decodedStream.on("data", (chunk) => chunks.push(chunk));
			decodedStream.on("end", () => {
				const buffer: Buffer[] = [];

				let isWakeWord = false;
				for (const frame of getInt16Frames(Buffer.concat(chunks), porcupine.frameLength)) {
					if (isWakeWord) buffer.push(Buffer.from(frame.buffer));
					else isWakeWord = porcupine.process(frame) !== -1;
				}

				resolve(Buffer.concat(buffer));
			});
		});
	}
}
