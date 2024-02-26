import { LoggerUtil } from "@luferro/shared-utils";
import {
	Leopard,
	LeopardActivationLimitReachedError,
	LeopardInvalidArgumentError,
	type LeopardTranscript,
} from "@picovoice/leopard-node";

import { bufferToInt16 } from "./utils/audio";

type Options = {
	/**
	 * Picovoice API key
	 */
	apiKey: string;
	/**
	 * Path to the Leopard model
	 */
	modelPath: string;
};

export class SpeechToTextClient {
	private logger: LoggerUtil.Logger;
	private leopard?: Leopard;

	constructor({ apiKey, modelPath }: Options) {
		this.logger = LoggerUtil.configureLogger();
		try {
			this.leopard = new Leopard(apiKey, { modelPath });
		} catch (error) {
			const isLimitReachedError = error instanceof LeopardActivationLimitReachedError;
			const isInvalidArgument = error instanceof LeopardInvalidArgumentError;

			if (isLimitReachedError) this.logger.warn("Leopard | User limit reached");
			else if (isInvalidArgument) this.logger.warn("Leopard | Invalid model path");
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
