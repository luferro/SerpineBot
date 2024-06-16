import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import type { VoiceCommandExecute } from "~/types/bot.js";

export const execute: VoiceCommandExecute = async ({ queue }) => {
	queue.tracks.clear();
	const embed = new EmbedBuilder().setTitle(t("interactions.music.queue.clear.embed.title")).setColor("Random");
	await queue.metadata.send({ embeds: [embed] });
};
