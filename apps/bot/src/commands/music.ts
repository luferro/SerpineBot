import type { Bot } from '../structures/bot';
import type { CommandData, CommandExecute } from '../types/bot';
import type { ExtendedChatInputCommandInteraction, ExtendedStringSelectMenuInteraction } from '../types/interaction';
import { StringSelectMenuBuilder } from 'discord.js';
import { ActionRowBuilder, ComponentType, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as Music from '../services/music';
import { CommandName } from '../types/enums';
import { randomUUID } from 'crypto';
import { QueueRepeatMode, Track } from 'discord-player';

export const data: CommandData = {
	name: CommandName.Music,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Music)
		.setDescription('Music related commands.')
		.addSubcommand((subcommand) => subcommand.setName('join').setDescription('Bot joins your voice channel.'))
		.addSubcommand((subcommand) => subcommand.setName('leave').setDescription('Bot leaves your voice channel.'))
		.addSubcommand((subcommand) => subcommand.setName('skip').setDescription('Skips the current track.'))
		.addSubcommand((subcommand) => subcommand.setName('pause').setDescription('Pauses the current track.'))
		.addSubcommand((subcommand) => subcommand.setName('resume').setDescription('Resumes paused track.'))
		.addSubcommand((subcommand) => subcommand.setName('queue').setDescription('Lists the guild queue.'))
		.addSubcommand((subcommand) => subcommand.setName('clear').setDescription('Removes every track in the queue.'))
		.addSubcommand((subcommand) => subcommand.setName('shuffle').setDescription('Shuffles the queue.'))
		.addSubcommand((subcommand) => subcommand.setName('bassboost').setDescription('Toggles the bass boost filter.'))
		.addSubcommand((subcommand) =>
			subcommand
				.setName('play')
				.setDescription('Plays the first result matching your search query.')
				.addStringOption((option) =>
					option.setName('query').setDescription('Youtube search query.').setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('search')
				.setDescription('Search the top 10 results for a given query.')
				.addStringOption((option) =>
					option.setName('query').setDescription('Youtube search query.').setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('seek')
				.setDescription('Jump to a given minute.')
				.addStringOption((option) =>
					option.setName('timestamp').setDescription('Timestamp to jump to (e.g. 2:30).').setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('remove')
				.setDescription('Removes a track from the queue.')
				.addIntegerOption((option) =>
					option
						.setName('position')
						.setDescription('Position in the queue of the item you wish to remove.')
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('loop')
				.setDescription('Sets a loop mode for the current track.')
				.addIntegerOption((option) =>
					option
						.setName('mode')
						.setDescription('Loop mode.')
						.setRequired(true)
						.addChoices(
							{ name: 'Off', value: QueueRepeatMode.OFF },
							{ name: 'Track', value: QueueRepeatMode.TRACK },
							{ name: 'Queue', value: QueueRepeatMode.QUEUE },
							{ name: 'Autoplay', value: QueueRepeatMode.AUTOPLAY },
						),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('volume')
				.setDescription('Sets player volume.')
				.addIntegerOption((option) =>
					option.setName('volume').setDescription('Player volume [0 - 100]%.').setRequired(true),
				),
		),
};

export const execute: CommandExecute = async ({ client, interaction }) => {
	const isMemberInVoiceChannel = interaction.member.voice.channel;
	if (!isMemberInVoiceChannel) throw new Error('Music related commands require you to be in a voice channel.');

	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (arg0: typeof client, arg1: typeof interaction) => Promise<void>> = {
		play: add,
		join,
		leave,
		remove,
		clear,
		search,
		pause,
		resume,
		seek,
		skip,
		loop,
		shuffle,
		volume,
		bassboost,
		queue,
	};

	await select[subcommand](client, interaction);
};

const add = async (client: Bot, interaction: ExtendedChatInputCommandInteraction) => {
	const query = interaction.options.getString('query', true);

	const guildId = interaction.guild.id;
	if (!Music.isConnectedToVoiceChannel(client, guildId)) Music.join(client, guildId, interaction.member);

	const data = await Music.search(client, query, interaction.user);

	if (data.playlist) {
		const { title, url, author, tracks } = data.playlist;
		const { playlistPositionStart, playlistPositionEnd } = await Music.addPlaylistToQueue(client, guildId, tracks);
		const positionStart = playlistPositionStart === 0 ? 'Currently playing' : playlistPositionStart;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.addFields([
				{
					name: '**Position in queue**',
					value: `Playlist start: ${positionStart}\nPlaylist end: ${playlistPositionEnd}`,
					inline: true,
				},
				{
					name: '**Channel**',
					value: author.name,
					inline: true,
				},
				{
					name: '**Count**',
					value: tracks.length.toString(),
					inline: true,
				},
			])
			.setColor('Random');

		await interaction.reply({ embeds: [embed] });
		return;
	}

	const { title, url, thumbnail, author, duration } = data.tracks[0];
	const { trackPosition } = await Music.addTrackToQueue(client, guildId, data.tracks[0]);

	const embed = new EmbedBuilder()
		.setTitle(title)
		.setURL(url)
		.setThumbnail(thumbnail)
		.addFields([
			{
				name: '**Position in queue**',
				value: trackPosition === 0 ? 'Currently playing' : trackPosition.toString(),
				inline: true,
			},
			{
				name: '**Channel**',
				value: author,
				inline: true,
			},
			{
				name: '**Duration**',
				value: duration,
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const join = async (client: Bot, interaction: ExtendedChatInputCommandInteraction) => {
	await Music.join(client, interaction.guild.id, interaction.member);
	await interaction.reply({ content: 'I have joined your voice channel. ', ephemeral: true });
};

const leave = async (client: Bot, interaction: ExtendedChatInputCommandInteraction) => {
	Music.leave(client, interaction.guild.id);
	await interaction.reply({ content: 'I have left your voice channel.', ephemeral: true });
};

const remove = async (client: Bot, interaction: ExtendedChatInputCommandInteraction) => {
	const position = interaction.options.getInteger('position', true);

	Music.removeFromQueue(client, interaction.guild.id, position);
	await queue(client, interaction);
};

const clear = async (client: Bot, interaction: ExtendedChatInputCommandInteraction) => {
	Music.clearQueue(client, interaction.guild.id);
	await queue(client, interaction);
};

const search = async (client: Bot, interaction: ExtendedChatInputCommandInteraction) => {
	const query = interaction.options.getString('query', true);

	const guildId = interaction.guild.id;
	if (!Music.isConnectedToVoiceChannel(client, guildId)) Music.join(client, guildId, interaction.member);

	const { tracks } = await Music.search(client, query, interaction.user, 10);

	const options = [
		...tracks.map(({ title, duration, url }, index) => ({
			label: `${index + 1}. ${title}`,
			description: duration,
			value: url,
		})),
		{ label: 'Cancel', description: `Stop searching for ${query}`, value: 'CANCEL' },
	];

	const uuid = randomUUID();
	const component = new ActionRowBuilder().addComponents(
		new StringSelectMenuBuilder().setCustomId(uuid).setPlaceholder('Nothing selected.').addOptions(options),
	) as ActionRowBuilder<StringSelectMenuBuilder>;

	const formattedResults = tracks
		.map(({ title, url, duration }, index) => `\`${index + 1}.\` **[${title}](${url})** | \`${duration}\``)
		.join('\n');

	const embed = new EmbedBuilder()
		.setTitle(`Search results for \`${query}\``)
		.setDescription(formattedResults)
		.setFooter({ text: "Select 'Cancel' from the selection menu to stop searching." })
		.setColor('Random');

	await interaction.reply({ embeds: [embed], components: [component], ephemeral: true });
	await handleSelectionMenu(client, interaction, uuid, tracks);
};

const handleSelectionMenu = async (
	client: Bot,
	interaction: ExtendedChatInputCommandInteraction,
	uuid: string,
	tracks: Track[],
) => {
	const guildId = interaction.guild.id;
	const textChannel = interaction.channel;
	const userId = interaction.user.id;

	const selectMenuInteraction = (await textChannel?.awaitMessageComponent({
		time: 60 * 1000,
		componentType: ComponentType.StringSelect,
		filter: ({ customId, user }: ExtendedStringSelectMenuInteraction) => customId === uuid && user.id === userId,
	})) as ExtendedStringSelectMenuInteraction;
	if (!selectMenuInteraction) throw new Error('Search timeout.');

	const isMemberInVoiceChannel = selectMenuInteraction.member.voice.channel;
	if (!isMemberInVoiceChannel) throw new Error('You must be in a voice channel to use the search menu.');
	if (!Music.isConnectedToVoiceChannel(client, guildId)) throw new Error("I'm not connected to a voice channel.");

	const { values } = selectMenuInteraction;
	const isSearchValid = values.length > 0 && values[0] !== 'CANCEL';
	if (!isSearchValid) {
		const cancelledEmbed = new EmbedBuilder().setTitle('Search has been canceled.').setColor('Random');
		await selectMenuInteraction.update({ embeds: [cancelledEmbed], components: [] });
		return;
	}

	const selectedTrack = tracks.find(({ url }) => url === values[0]);
	if (!selectedTrack) throw new Error('Cannot find track.');

	const { title, url, thumbnail, author, duration } = selectedTrack;
	const { trackPosition } = await Music.addTrackToQueue(client, guildId, selectedTrack);

	const embed = new EmbedBuilder()
		.setTitle(title)
		.setURL(url)
		.setThumbnail(thumbnail)
		.addFields([
			{
				name: '**Position in queue**',
				value: trackPosition === 0 ? 'Currently playing' : trackPosition.toString(),
				inline: true,
			},
			{
				name: '**Channel**',
				value: author,
				inline: true,
			},
			{
				name: '**Duration**',
				value: duration,
				inline: true,
			},
		])
		.setColor('Random');

	await selectMenuInteraction.update({ embeds: [embed], components: [] });
};

const pause = async (client: Bot, interaction: ExtendedChatInputCommandInteraction) => {
	const { pausedTrack } = Music.pause(client, interaction.guild.id);
	const embed = new EmbedBuilder().setTitle(`Pausing \`${pausedTrack}\`.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

const resume = async (client: Bot, interaction: ExtendedChatInputCommandInteraction) => {
	const { resumedTrack } = Music.resume(client, interaction.guild.id);
	const embed = new EmbedBuilder().setTitle(`Resuming \`${resumedTrack}\`.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

const seek = async (client: Bot, interaction: ExtendedChatInputCommandInteraction) => {
	const timestamp = interaction.options.getString('timestamp', true);

	await Music.seek(client, interaction.guild.id, timestamp);
	const embed = new EmbedBuilder().setTitle(`Started playing from \`${timestamp}\`.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

const skip = async (client: Bot, interaction: ExtendedChatInputCommandInteraction) => {
	const { currentTrack, skippedTrack } = Music.skip(client, interaction.guild.id);

	const embed = new EmbedBuilder()
		.setTitle(`Skipped \`${skippedTrack}\`.`)
		.setDescription(`Now playing \`${currentTrack}\`.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const loop = async (client: Bot, interaction: ExtendedChatInputCommandInteraction) => {
	const mode = interaction.options.getInteger('mode', true) as QueueRepeatMode;

	Music.loop(client, interaction.guild.id, mode);

	const embed = new EmbedBuilder()
		.setTitle(`Loop mode set to ${QueueRepeatMode[mode].toLowerCase()}`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const shuffle = async (client: Bot, interaction: ExtendedChatInputCommandInteraction) => {
	Music.shuffle(client, interaction.guild.id);
	const embed = new EmbedBuilder().setTitle('Queue has been shuffled.').setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

const volume = async (client: Bot, interaction: ExtendedChatInputCommandInteraction) => {
	const volume = interaction.options.getInteger('volume', true);

	Music.volume(client, interaction.guild.id, volume);
	const embed = new EmbedBuilder().setTitle(`Volume has been set to ${volume}%.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

const bassboost = async (client: Bot, interaction: ExtendedChatInputCommandInteraction) => {
	await Music.enableBassBoost(client, interaction.guild.id);
	const embed = new EmbedBuilder().setTitle('Bass boost filter has been enabled.').setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

const queue = async (client: Bot, interaction: ExtendedChatInputCommandInteraction) => {
	const { currentTrack, queue } = Music.queue(client, interaction.guild.id);

	const formattedQueue = queue
		.slice(0, 10)
		.map(
			({ title, duration, requestedBy }, index) =>
				`\`${index + 1}.\` **${title}** | **${duration}**\nRequest by \`${requestedBy.tag}\``,
		);

	const embed = new EmbedBuilder()
		.setTitle(`Queue for ${interaction.guild.name}`)
		.addFields([
			{
				name: '**Now playing**',
				value: currentTrack
					? `**[${currentTrack.title}](${currentTrack.url})** | **${currentTrack.duration}**\nRequest by \`${currentTrack.requestedBy.tag}\``
					: 'Nothing is playing.',
			},
			{ name: '**Queue**', value: formattedQueue.join('\n') || 'Queue is empty.' },
		])
		.setFooter({ text: `${queue.length} total items in queue.` })
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};
