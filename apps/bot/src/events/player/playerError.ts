import type { GuildQueue } from "discord-player";
import { EmbedBuilder, type TextChannel } from "discord.js";
import { t } from "i18next";
import type { EventData, EventExecute } from "~/types/bot.js";

type Args = [queue: GuildQueue<TextChannel>, error: Error];

export const data: EventData = { listener: "player", type: "on" };

export const execute: EventExecute<Args> = async ({ client, rest: [queue, error] }) => {
	const { metadata } = queue;
	client.emit("clientError", error);
	const embed = new EmbedBuilder().setTitle(t("events.player.playerError.embed.title"));
	await metadata.send({ embeds: [embed] });
};
