import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import type { VoiceCommandExecute } from "~/types/bot.js";

export const execute: VoiceCommandExecute = async ({ queue, slots }) => {
	if (queue.isEmpty()) throw new Error(t("errors.player.queue.empty"));

	const position = Number(slots.position);
	const removedTrack = queue.node.remove(position - 1);
	if (!removedTrack) throw new Error(t("errors.player.queue.tracks.position", { position: `\`${position}\`` }));

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.music.queue.remove.embeds.2.title", { title: removedTrack.title, position }))
		.setColor("Random");
	await queue.metadata.send({ embeds: [embed] });
};
