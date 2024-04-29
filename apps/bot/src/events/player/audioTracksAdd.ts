import type { GuildQueue, Track } from "discord-player";
import { EmbedBuilder, type TextBasedChannel } from "discord.js";
import { t } from "i18next";
import type { EventData, EventExecute } from "~/types/bot.js";

type Args = [queue: GuildQueue<TextBasedChannel>, tracks: Track[]];

export const data: EventData = { type: "on" };

export const execute: EventExecute<Args> = async ({ rest: [queue, tracks] }) => {
	const { metadata } = queue;
	const { playlist, requestedBy } = tracks[0];
	if (!playlist) return;

	const embed = new EmbedBuilder()
		.setAuthor({
			iconURL: requestedBy?.avatarURL() ?? requestedBy?.defaultAvatarURL,
			name: t("events.player.audioTracksAdd.embed.author.name"),
		})
		.setTitle(playlist.title)
		.setURL(playlist.url)
		.setThumbnail(playlist.thumbnail)
		.addFields([
			{
				name: t("events.player.audioTracksAdd.embed.fields.0.name"),
				value: playlist.tracks.length.toString(),
			},
		])
		.setColor("Random");

	await metadata.send({ embeds: [embed] });
};
