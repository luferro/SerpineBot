import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import type { VoiceCommandExecute } from "../../../../types/bot";

export const execute: VoiceCommandExecute = async ({ queue, slots }) => {
	if (!queue.currentTrack) throw new Error(t("errors.player.playback.nothing"));
	if (queue.isEmpty()) throw new Error(t("errors.player.queue.empty"));

	const position = Number(slots.position);

	const currentTrack = queue.currentTrack;
	const nextTrack = queue.tracks.at(position ? position - 1 : 0);

	const isSuccessful = position ? queue.node.skipTo(position - 1) : queue.node.skip();
	if (!isSuccessful) throw new Error(t("errors.player.queue.tracks.position", { position: `\`${position}\`` }));
	const embed = new EmbedBuilder()
		.setTitle(t("interactions.music.player.skip.embed.title", { track: `\`${currentTrack}\`` }))
		.setDescription(t("interactions.music.player.skip.embed.description", { track: `\`${nextTrack}\`` }))
		.setColor("Random");

	await queue.metadata.send({ embeds: [embed] });
};
