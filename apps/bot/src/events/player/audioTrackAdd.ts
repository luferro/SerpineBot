import { EmbedBuilder, TextBasedChannel } from "discord.js";
import { GuildQueue, Track } from "discord-player";
import { t } from "i18next";

import type { EventData, EventExecute } from "../../types/bot";

type Args = [queue: GuildQueue<TextBasedChannel>, track: Track];

export const data: EventData = { type: "on" };

export const execute: EventExecute<Args> = async ({ client, rest: [queue, track] }) => {
	const { metadata, currentTrack } = queue;

	const userIconUrl = track.requestedBy?.avatarURL() ?? track.requestedBy?.defaultAvatarURL;
	const clientIconUrl = client.user?.avatarURL() ?? client.user?.defaultAvatarURL;

	const embed = new EmbedBuilder()
		.setTitle(track.title)
		.setURL(track.url)
		.setThumbnail(track.thumbnail)
		.setColor("Random");

	if (!currentTrack && queue.tracks.size === 1) {
		embed
			.setAuthor({ iconURL: clientIconUrl, name: t("events.player.audioTrackAdd.embeds.0.author.name") })
			.setFields([
				{
					name: t("events.player.audioTrackAdd.embeds.0.fields.0.name"),
					value: `**${track.duration}**`,
				},
			])
			.setFooter({
				iconURL: userIconUrl,
				text: t("events.player.audioTrackAdd.embeds.0.footer.text", { user: track.requestedBy?.username }),
			});
	} else embed.setAuthor({ iconURL: userIconUrl, name: t("events.player.audioTrackAdd.embeds.1.author.name") });

	await metadata.send({ embeds: [embed] });
};
