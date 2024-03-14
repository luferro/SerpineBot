import { Readable } from "node:stream";
import { createAudioResource } from "discord-voip";
import { t } from "i18next";
import type { VoiceCommandExecute } from "../../../../types/bot";

export const execute: VoiceCommandExecute = async ({ client, queue }) => {
	const { sale } = await client.api.gaming.platforms.steam.getUpcomingSales();
	if (!sale) throw new Error(t("errors.search.none"));

	const resource = createAudioResource(Readable.from(await client.speech.textToSpeech.synthesizeSpeech(sale)));
	await queue.node.playRaw(resource);
};
