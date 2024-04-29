import { QueueRepeatMode } from "discord-player";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";
import type { VoiceCommandExecute } from "~/types/bot.js";

export const execute: VoiceCommandExecute = async ({ queue, slots }) => {
	const repeatMode: Record<string, QueueRepeatMode> = {
		OFF: QueueRepeatMode.OFF,
		TRACK: QueueRepeatMode.TRACK,
		QUEUE: QueueRepeatMode.QUEUE,
		"AUTO PLAY": QueueRepeatMode.AUTOPLAY,
	};
	const mode = slots.mode;
	queue.setRepeatMode(repeatMode[mode]);

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.music.player.loop.embed.title", { mode: repeatMode[mode] }))
		.setColor("Random");

	await queue.metadata.send({ embeds: [embed] });
};
