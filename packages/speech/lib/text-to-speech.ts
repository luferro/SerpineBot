import { TextToSpeechClient as _TextToSpeechClient } from "@google-cloud/text-to-speech";

type SynthesizeSpeech = InstanceType<typeof _TextToSpeechClient>["synthesizeSpeech"];
type VoiceConfig = Parameters<SynthesizeSpeech>["0"]["voice"];
type AudioConfig = Parameters<SynthesizeSpeech>["0"]["audioConfig"];

export class TextToSpeechClient {
	private tts: _TextToSpeechClient;

	private voiceConfig: VoiceConfig = { name: "en-US-Standard-J", languageCode: "en-US", ssmlGender: "MALE" };
	private audioConfig: AudioConfig = { audioEncoding: "OGG_OPUS" };

	constructor(credentialsPath: string) {
		this.tts = new _TextToSpeechClient({ keyFilename: credentialsPath });
	}

	withVoiceConfig(config: VoiceConfig) {
		this.voiceConfig = config;
		return this;
	}

	withAudioConfig(config: AudioConfig) {
		this.audioConfig = config;
		return this;
	}

	async synthesizeSpeech(text: string) {
		const [{ audioContent }] = await this.tts.synthesizeSpeech({
			input: { text },
			voice: this.voiceConfig,
			audioConfig: this.audioConfig,
		});
		if (!audioContent) throw new Error("Cannot synthesize speech.");

		return audioContent;
	}
}
