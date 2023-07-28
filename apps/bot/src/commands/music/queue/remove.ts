import { randomUUID } from 'crypto';
import {
	ActionRowBuilder,
	ComponentType,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
	StringSelectMenuBuilder,
} from 'discord.js';
import { Playlist } from 'discord-player';

import { Bot } from '../../../Bot';
import type { CommandData, CommandExecute } from '../../../types/bot';
import { ExtendedStringSelectMenuInteraction } from '../../../types/interaction';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('remove')
	.setDescription('Removes a track or playlist from the queue.')
	.addIntegerOption((option) => option.setName('position').setDescription('Queue track position').setMinValue(1));

export const execute: CommandExecute = async ({ client, interaction }) => {
	const position = interaction.options.getInteger('position');

	if (position) removeTrack({ client, interaction, position });
	else removePlaylist({ client, interaction });
};

const removeTrack = async ({ client, interaction, position }: Parameters<typeof execute>[0] & { position: number }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot remove tracks.');

	const removedTrack = queue.node.remove(position - 1);
	if (!removedTrack) throw new Error(`No track found in position \`${position}\`.`);

	await Bot.commands.execute.get('music.queue.list')!({ client, interaction });
};

const removePlaylist = async ({ client, interaction }: Parameters<typeof execute>[0]) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot remove playlists.');

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
	if (options.length === 0) throw new Error('There are no playlists in the queue.');

	const uuid = randomUUID();
	const stringSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(uuid)
		.setPlaceholder('Nothing selected.')
		.addOptions(options)
		.setMaxValues(options.length);
	const component = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(stringSelectMenu);

	const embed = new EmbedBuilder().setTitle('Select which playlist to remove from the queue.').setColor('Random');
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
	if (!selectMenuInteraction) throw new Error('Playlist removal timeout.');

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('No queue in place.');

	for (const playlistId of selectMenuInteraction.values) {
		const tracks = queue.tracks.filter((track) => track.playlist?.id === playlistId);
		for (const track of tracks) {
			queue.node.remove(track);
		}
	}

	const embed = new EmbedBuilder()
		.setTitle(`${selectMenuInteraction.values.length} playlist(s) removed.`)
		.setColor('Random');

	await selectMenuInteraction.update({ embeds: [embed], components: [] });
};
