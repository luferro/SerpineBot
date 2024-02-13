import { LoggerUtil } from "@luferro/shared-utils";
import { getInt16Frames, Rhino, RhinoErrors, RhinoInference } from "@picovoice/rhino-node";

import { bufferToInt16 } from "./utils/audio";

type Options = {
	/**
	 * Picovoice API key
	 */
	apiKey: string;
	/**
	 * Path to the Rhino model
	 */
	modelPath: string;
};

export class SpeechToIntentClient {
	private logger: LoggerUtil.Logger;
	private rhino?: Rhino;

	constructor({ apiKey, modelPath }: Options) {
		this.logger = LoggerUtil.configureLogger();
		try {
			this.rhino = new Rhino(apiKey, modelPath, 0.5, 0.5, false);
		} catch (error) {
			const isLimitReachedError = error instanceof RhinoErrors.RhinoActivationLimitReachedError;
			const isInvalidArgument = error instanceof RhinoErrors.RhinoInvalidArgumentError;

			if (isLimitReachedError) this.logger.warn("Rhino: User limit reached.");
			else if (isInvalidArgument) this.logger.warn("Rhino: Invalid model path.");
			else throw error;
		}
	}

	infere(buffer: Buffer) {
		const rhino = this.rhino;
		if (!rhino) return Promise.resolve(null);

		return new Promise<Omit<Required<RhinoInference>, "isUnderstood"> | null>((resolve) => {
			const pcm = bufferToInt16(buffer);
			const silentFrames = bufferToInt16(Buffer.alloc(pcm.length, 0xffff));
			for (const _pcm of [silentFrames, pcm, silentFrames]) {
				let intentDetected = false;
				for (const frame of getInt16Frames(_pcm, rhino.frameLength)) {
					intentDetected = rhino.process(frame);
					if (!intentDetected) continue;

					const { isUnderstood, intent, slots } = rhino.getInference();
					if (isUnderstood) resolve({ intent: intent!, slots: slots! });
					else resolve(null);
				}
			}

			resolve(null);
		});
	}
}
