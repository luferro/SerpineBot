import { StringUtil } from "@luferro/shared-utils";
import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type {
	InteractionCommandAutoComplete,
	InteractionCommandData,
	InteractionCommandExecute,
} from "../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.music.play.name"))
	.setDescription(t("interactions.music.play.description"))
	.addStringOption((option) =>
		option
			.setName(t("interactions.music.play.options.0.name"))
			.setDescription(t("interactions.music.play.options.0.description"))
			.setRequired(true)
			.setAutocomplete(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });
	const query = interaction.options.getString(data.options[0].name, true);

	const voiceChannel = interaction.member.voice.channel;
	if (!voiceChannel) throw new Error(t("errors.voice.member.channel"));

	const {
		track,
		queue,
		searchResult: { playlist },
	} = await client.player.play(voiceChannel, query, {
		requestedBy: interaction.user,
		nodeOptions: { metadata: interaction.channel, ...client.player.defaultNodeOptions },
	});

	const position = queue.node.getTrackPosition(playlist?.tracks[0] ?? track) + 1;
	const embed = new EmbedBuilder()
		.setAuthor({ name: playlist?.author.name ?? track.author })
		.setTitle(playlist?.title ?? track.title)
		.setURL(playlist?.url ?? track.url)
		.setThumbnail(playlist?.thumbnail ?? track.thumbnail)
		.addFields([
			{
				name: t("interactions.music.play.embed.fields.0.name"),
				value: position === 0 ? t("common.player.playback.playing") : position.toString(),
				inline: true,
			},
			{
				name: t("interactions.music.play.embed.fields.1.name"),
				value: playlist?.durationFormatted ?? track.duration,
				inline: true,
			},
		])
		.setColor("Random");

	await interaction.editReply({ embeds: [embed] });
};

export const autocomplete: InteractionCommandAutoComplete = async ({ client, interaction }) => {
	const { value: query } = interaction.options.getFocused(true);
	if (query.length < 3) return interaction.respond([]);

	const results = await client.player.search(query);
	await interaction.respond(
		results.tracks.slice(0, 10).map((track) => {
			const maxLength = 100;
			const limit = maxLength - track.author.length - track.duration.length - 6;

			return {
				name: `${track.author} - ${StringUtil.truncate(track.title, limit)} | ${track.duration}`,
				value: track.url,
			};
		}),
	);
};
