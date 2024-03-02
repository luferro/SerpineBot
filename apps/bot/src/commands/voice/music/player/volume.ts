import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import type { VoiceCommandExecute } from "../../../../types/bot";

export const execute: VoiceCommandExecute = async ({ queue, slots }) => {
	const volume = Number(slots.percentage.match(/\d+/g)?.[0] ?? queue.node.volume);
	queue.node.setVolume(volume);

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.music.player.volume.embed.title", { volume }))
		.setColor("Random");
	await queue.metadata.send({ embeds: [embed] });
};
