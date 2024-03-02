import { t } from "i18next";
import type { VoiceCommandExecute } from "../../../../types/bot";

export const execute: VoiceCommandExecute = async ({ queue }) => {
	if (queue.history.isEmpty()) throw new Error(t("errors.player.playback.previous"));
	queue.history.previous();
};
