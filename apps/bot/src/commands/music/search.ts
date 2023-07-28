import { randomUUID } from 'crypto';
import {
	ActionRowBuilder,
	ComponentType,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
	StringSelectMenuBuilder,
	TextBasedChannel,
} from 'discord.js';
import { QueryType, Track } from 'discord-player';

import { Bot } from '../../Bot';
import type { CommandData, CommandExecute } from '../../types/bot';
import { ExtendedStringSelectMenuInteraction } from '../../types/interaction';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('search')
	.setDescription('Searches and plays / enqueues track.')
	.addStringOption((option) =>
		option.setName('query').setDescription('Track query.').setRequired(true).setAutocomplete(true),
	);

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const query = interaction.options.getString('query', true);

	const results = await client.player.search(query, { searchEngine: QueryType.AUTO });
	if (!results.hasTracks()) throw new Error(`No tracks found matching \`${query}\`.`);

	const options = [
		...results.tracks.map(({ title, url }) => ({ label: title, value: url })),
		{ label: 'Cancel', description: `Stop searching for ${query}`, value: 'CANCEL' },
	];

	const uuid = randomUUID();
	const stringSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(uuid)
		.setPlaceholder('Nothing selected.')
		.addOptions(options);
	const component = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(stringSelectMenu);

	const embed = new EmbedBuilder()
		.setTitle('Pick a track from the select menu below.')
		.setFooter({ text: 'Select "Cancel" to stop searching.' })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed], components: [component] });

	await handleStringSelectMenu({ client, channel: interaction.channel!, uuid, tracks: results.tracks });
};

const handleStringSelectMenu = async ({
	client,
	channel,
	uuid,
	tracks,
}: {
	client: Bot;
	channel: TextBasedChannel;
	uuid: string;
	tracks: Track[];
}) => {
	const interaction = (await channel.awaitMessageComponent({
		time: 60 * 1000,
		componentType: ComponentType.StringSelect,
		filter: ({ customId }) => customId === uuid,
	})) as ExtendedStringSelectMenuInteraction;
	if (!interaction) throw new Error('Search timeout.');

	const isSearchValid = interaction.values.length > 0 && interaction.values[0] !== 'CANCEL';
	if (!isSearchValid) throw new Error('Search has been canceled.');

	const selectedTrack = tracks.find(({ url }) => url === interaction.values[0]);
	if (!selectedTrack) throw new Error('Cannot find selected track.');

	const voiceChannel = interaction.member.voice.channel;
	if (!voiceChannel) throw new Error('You are not in a voice channel.');

	const { track, queue } = await client.player.play(voiceChannel, selectedTrack, {
		requestedBy: interaction.user,
		searchEngine: QueryType.AUTO,
		nodeOptions: {
			metadata: interaction.channel,
			...client.connection.config,
		},
	});

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

	await interaction.update({ embeds: [embed], components: [] });
};
