import { t } from "i18next";
import type { VoiceCommandExecute } from "../../../../types/bot";

export const execute: VoiceCommandExecute = async ({ queue }) => {
	if (!queue.currentTrack) throw new Error(t("errors.player.playback.nothing"));
	queue.node.pause();
};
