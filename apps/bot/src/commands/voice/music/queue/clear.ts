import { EmbedBuilder } from "discord.js";
import { t } from "i18next";

import type { VoiceCommandExecute } from "../../../../types/bot";

export const execute: VoiceCommandExecute = async ({ queue }) => {
	queue.tracks.clear();
	const embed = new EmbedBuilder().setTitle(t("interactions.music.queue.clear.embed.title")).setColor("Random");
	queue.metadata.send({ embeds: [embed] });
};
