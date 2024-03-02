import { t } from "i18next";
import type { VoiceCommandExecute } from "../../../../types/bot";

export const execute: VoiceCommandExecute = async ({ queue }) => {
	if (queue.isEmpty()) throw new Error(t("errors.player.queue.empty"));
	queue.tracks.shuffle();
};
