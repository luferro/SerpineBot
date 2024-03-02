import { randomUUID } from "crypto";
import { Playlist } from "discord-player";
import {
	ActionRowBuilder,
	ComponentType,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
	StringSelectMenuBuilder,
} from "discord.js";
import { t } from "i18next";
import { Bot } from "../../../../structures/Bot";
import type { InteractionCommandData, InteractionCommandExecute } from "../../../../types/bot";
import { ExtendedStringSelectMenuInteraction } from "../../../../types/interaction";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.music.queue.remove.name"))
	.setDescription(t("interactions.music.queue.remove.description"))
	.addIntegerOption((option) =>
		option
			.setName(t("interactions.music.queue.remove.options.0.name"))
			.setDescription(t("interactions.music.queue.remove.options.0.description"))
			.setMinValue(1),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const position = interaction.options.getInteger(data.options[0].name);

	if (position) removeTrack({ client, interaction, position });
	else removePlaylist({ client, interaction });
};

const removeTrack = async ({ client, interaction, position }: Parameters<typeof execute>[0] & { position: number }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error(t("errors.player.node"));

	const removedTrack = queue.node.remove(position - 1);
	if (!removedTrack) throw new Error(t("errors.player.queue.tracks.position", { position: `\`${position}\`` }));

	await Bot.commands.interactions.methods.get("music.queue.list")?.execute({ client, interaction });
};

const removePlaylist = async ({ client, interaction }: Parameters<typeof execute>[0]) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error(t("errors.player.node"));

	const options = queue.tracks
		.toArray()
		.reduce((acc, { playlist }) => {
			const exists = acc.some((entry) => entry.id === playlist?.id);
			if (playlist && !exists) acc.push(playlist);
			return acc;
		}, [] as Playlist[])
		.slice(0, 25)
		.sort((a, b) => a.title.localeCompare(b.title))
		.map(({ id, title, author }, index) => ({
			label: `${index + 1}. ${title}`,
			description: author.name,
			value: id,
		}));
	if (options.length === 0) throw new Error(t("errors.player.playlists.none"));

	const uuid = randomUUID();
	const stringSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(uuid)
		.setPlaceholder(t("interactions.music.queue.remove.menu.placeholder"))
		.addOptions(options)
		.setMaxValues(options.length);
	const component = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(stringSelectMenu);

	const embed = new EmbedBuilder().setTitle(t("interactions.music.queue.remove.embeds.0.title")).setColor("Random");
	await interaction.reply({ embeds: [embed], components: [component] });
	await handleStringSelectMenu({ client, interaction, uuid });
};

const handleStringSelectMenu = async ({
	client,
	interaction,
	uuid,
}: Parameters<typeof execute>[0] & { uuid: string }) => {
	const selectMenuInteraction = (await interaction.channel?.awaitMessageComponent({
		time: 60 * 1000 * 2,
		componentType: ComponentType.StringSelect,
		filter: ({ customId, user }) => customId === uuid && user.id === interaction.user.id,
	})) as ExtendedStringSelectMenuInteraction;
	if (!selectMenuInteraction) throw new Error(t("errors.interaction.timeout"));

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error(t("errors.player.node"));

	for (const playlistId of selectMenuInteraction.values) {
		const tracks = queue.tracks.filter((track) => track.playlist?.id === playlistId);
		for (const track of tracks) {
			queue.node.remove(track);
		}
	}

	const embed = new EmbedBuilder()
		.setTitle(
			t("interactions.music.queue.remove.embeds.1.title", { size: `**${selectMenuInteraction.values.length}**` }),
		)
		.setColor("Random");

	await selectMenuInteraction.update({ embeds: [embed], components: [] });
};
