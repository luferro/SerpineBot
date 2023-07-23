import { randomUUID } from 'crypto';
import {
	ActionRowBuilder,
	ComponentType,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
	StringSelectMenuBuilder,
} from 'discord.js';
import { QueryType, Track } from 'discord-player';

import type { CommandData, CommandExecute } from '../../types/bot';
import { ExtendedStringSelectMenuInteraction } from '../../types/interaction';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('search')
	.setDescription('Search the top 10 results for a given query.')
	.addStringOption((option) => option.setName('query').setDescription('Youtube search query.').setRequired(true));

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const query = interaction.options.getString('query', true);

	const { tracks } = await client.player.search(query, {
		requestedBy: interaction.user,
		searchEngine: QueryType.AUTO,
	});
	const filteredTracks = tracks.filter(({ duration }) => !/0?0:00/.test(duration)).slice(0, 10);
	if (filteredTracks.length === 0) throw new Error(`No matches for ${query}.`);

	const options = [
		...filteredTracks.map(({ title, duration, url }, index) => ({
			label: `${index + 1}. ${title}`,
			description: duration,
			value: url,
		})),
		{ label: 'Cancel', description: `Stop searching for ${query}`, value: 'CANCEL' },
	];

	const uuid = randomUUID();
	const stringSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(uuid)
		.setPlaceholder('Nothing selected.')
		.addOptions(options);
	const component = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(stringSelectMenu);

	const formattedResults = filteredTracks.map(
		({ title, url, duration }, index) => `\`${index + 1}.\` **[${title}](${url})** | \`${duration}\``,
	);

	const embed = new EmbedBuilder()
		.setTitle(`Search results for \`${query}\``)
		.setDescription(formattedResults.join('\n'))
		.setFooter({ text: 'Select "Cancel" from the selection menu to stop searching.' })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed], components: [component] });

	await handleStringSelectMenu({ client, interaction, uuid, tracks: filteredTracks });
};

const handleStringSelectMenu = async ({
	client,
	interaction,
	uuid,
	tracks,
}: Parameters<typeof execute>[0] & { uuid: string; tracks: Track[] }) => {
	const selectMenuInteraction = (await interaction.channel?.awaitMessageComponent({
		time: 60 * 1000,
		componentType: ComponentType.StringSelect,
		filter: ({ customId, user }) => customId === uuid && user.id === interaction.user.id,
	})) as ExtendedStringSelectMenuInteraction;
	if (!selectMenuInteraction) throw new Error('Search timeout.');

	const isSearchValid = selectMenuInteraction.values.length > 0 && selectMenuInteraction.values[0] !== 'CANCEL';
	if (!isSearchValid) {
		const embed = new EmbedBuilder().setTitle('Search has been canceled.').setColor('Random');
		await selectMenuInteraction.update({ embeds: [embed], components: [] });
		return;
	}

	const track = tracks.find(({ url }) => url === selectMenuInteraction.values[0]);
	if (!track) throw new Error('Cannot find selected track.');

	const queue = await forceJoin({ client, interaction });
	queue.addTrack(track);
	if (!queue.node.isPlaying()) await queue.node.play();

	const position = queue.node.getTrackPosition(track) + 1;

	const embed = new EmbedBuilder()
		.setAuthor({ name: track.author })
		.setTitle(track.title)
		.setURL(track.url)
		.setThumbnail(track.thumbnail)
		.addFields([
			{
				name: '**Position**',
				value: position === 0 ? 'Currently playing' : position.toString(),
				inline: true,
			},
			{
				name: '**Duration**',
				value: track.duration,
				inline: true,
			},
		])
		.setColor('Random');

	await selectMenuInteraction.update({ embeds: [embed], components: [] });
};

const forceJoin = async ({ client, interaction }: Parameters<typeof execute>[0]) => {
	let queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) {
		const memberVoiceChannel = interaction.member.voice.channel;
		if (!memberVoiceChannel) throw new Error('You are not in a voice channel.');

		queue = client.player.nodes.create(interaction.guild.id, { leaveOnEmptyCooldown: 1000 * 60 * 5 });
		await queue.connect(memberVoiceChannel);
	}
	return queue;
};
