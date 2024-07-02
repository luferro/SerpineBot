import { type Logger, configureLogger } from "@luferro/helpers/logger";
import {
	Leopard,
	LeopardActivationLimitReachedError,
	LeopardInvalidArgumentError,
	LeopardRuntimeError,
	type LeopardTranscript,
} from "@picovoice/leopard-node";
import { bufferToInt16 } from "./utils/audio.js";

export class SpeechToTextClient {
	private logger: Logger;
	private leopard?: Leopard;

	constructor(apiKey: string, modelPath: string) {
		this.logger = configureLogger();
		try {
			this.leopard = new Leopard(apiKey, { modelPath });
		} catch (error) {
			const isLimitReachedError = error instanceof LeopardActivationLimitReachedError;
			const isInvalidArgument = error instanceof LeopardInvalidArgumentError;
			const isRuntimeError = error instanceof LeopardRuntimeError;

			if (isLimitReachedError) this.logger.warn("Leopard | User limit reached");
			else if (isInvalidArgument) this.logger.warn("Leopard | Invalid model path");
			else if (isRuntimeError) this.logger.warn("Leopard | Runtime error");
			else throw error;
		}
	}

	transcribe(buffer: Buffer) {
		const leopard = this.leopard;
		if (!leopard) return Promise.resolve({ transcript: "", words: [] });

		return new Promise<LeopardTranscript>((resolve) => {
			const pcm = bufferToInt16(buffer);
			resolve(leopard.process(pcm));
		});
	}
}
