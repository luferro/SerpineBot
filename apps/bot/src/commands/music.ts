import type { CommandData } from '../types/bot';
import type { ExtendedChatInputCommandInteraction } from '../types/interaction';
import { Guild, GuildMember, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js';
import { ActionRowBuilder, ComponentType, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { YoutubeApi } from '@luferro/google-api';
import { Bot } from '../structures/bot';
import * as Music from '../services/music';
import { CommandName } from '../types/enums';
import { randomUUID } from 'crypto';

export const data: CommandData = {
	name: CommandName.Music,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Music)
		.setDescription('Music related commands.')
		.addSubcommand((subcommand) =>
			subcommand.setName('join').setDescription("Bot joins the voice channel you're in."),
		)
		.addSubcommand((subcommand) => subcommand.setName('leave').setDescription('Bot leaves the voice channel.'))
		.addSubcommand((subcommand) => subcommand.setName('skip').setDescription('Skips the current item playing.'))
		.addSubcommand((subcommand) => subcommand.setName('pause').setDescription('Pauses the current item playing.'))
		.addSubcommand((subcommand) => subcommand.setName('resume').setDescription('Resumes paused item.'))
		.addSubcommand((subcommand) => subcommand.setName('loop').setDescription('Sets the current item in loop.'))
		.addSubcommand((subcommand) => subcommand.setName('queue').setDescription('Lists the current queue.'))
		.addSubcommand((subcommand) => subcommand.setName('clear').setDescription('Removes every item in the queue.'))
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
				.setDescription('Removes an item from the queue matching a given position.')
				.addIntegerOption((option) =>
					option
						.setName('position')
						.setDescription('Position in the queue of the item you wish to remove.')
						.setRequired(true),
				),
		),
};

export const execute = async (interaction: ExtendedChatInputCommandInteraction) => {
	const isMemberInVoiceChannel = interaction.member.voice.channel;
	if (!isMemberInVoiceChannel) throw new Error('Music related commands require you to be in a voice channel.');

	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (arg0: typeof interaction) => Promise<void>> = {
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
		queue,
	};

	await select[subcommand](interaction);
};

const add = async (interaction: ExtendedChatInputCommandInteraction) => {
	const guildId = interaction.guild.id;
	if (!Bot.music.has(guildId)) Music.join(guildId, interaction.member);

	const query = interaction.options.getString('query', true);

	const isPlaylist = await YoutubeApi.isPlaylist(query);
	if (isPlaylist) {
		const { title, url, channel, count, videos } = await YoutubeApi.getPlaylist(query);
		for (const video of videos) {
			const music = {
				...video,
				playlist: { title, url },
				requested: interaction.user.tag,
			};

			await Music.addToQueue(guildId, music).catch((error: Error) => error);
		}

		const embed = new EmbedBuilder()
			.setAuthor({ name: 'Added to queue', iconURL: interaction.user.avatarURL() ?? '' })
			.setTitle(title)
			.setURL(url)
			.addFields([
				{
					name: '**Channel**',
					value: channel ?? 'N/A',
					inline: true,
				},
				{
					name: '**Count**',
					value: count?.toString() ?? 'N/A',
					inline: true,
				},
			])
			.setColor('Random');

		await interaction.reply({ embeds: [embed] });
		return;
	}

	const isVideo = YoutubeApi.isVideo(query);
	const data = isVideo ? await YoutubeApi.getVideoDetails(query) : (await YoutubeApi.search(query)).shift();
	if (!data) throw new Error(`No matches for ${query}.`);

	const music = {
		...data,
		requested: interaction.user.tag,
	};

	const { position } = await Music.addToQueue(guildId, music);

	const embed = new EmbedBuilder()
		.setAuthor({ name: 'Added to queue', iconURL: interaction.user.avatarURL() ?? '' })
		.setTitle(music.title)
		.setURL(music.url)
		.setThumbnail(music.thumbnail)
		.addFields([
			{
				name: '**Position in queue**',
				value: position === 0 ? 'Currently playing' : position.toString(),
				inline: true,
			},
			{
				name: '**Channel**',
				value: music.channel ?? 'N/A',
				inline: true,
			},
			{
				name: '**Duration**',
				value: music.duration,
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const join = async (interaction: ExtendedChatInputCommandInteraction) => {
	Music.join(interaction.guild.id, interaction.member);
	await interaction.reply({ content: 'SerpineBot has joined your voice channel. ', ephemeral: true });
};

const leave = async (interaction: ExtendedChatInputCommandInteraction) => {
	Music.leave(interaction.guild.id);
	await interaction.reply({ content: 'SerpineBot has left your voice channel.', ephemeral: true });
};

const remove = async (interaction: ExtendedChatInputCommandInteraction) => {
	const position = interaction.options.getInteger('position', true);

	await Music.removeFromQueue(interaction.guild.id, position);
	await queue(interaction);
};

const clear = async (interaction: ExtendedChatInputCommandInteraction) => {
	await Music.clearQueue(interaction.guild.id);
	await queue(interaction);
};

const search = async (interaction: ExtendedChatInputCommandInteraction) => {
	const guildId = interaction.guild.id;
	if (!Bot.music.has(guildId)) Music.join(guildId, interaction.member);

	const query = interaction.options.getString('query', true);
	const results = await YoutubeApi.search(query, 10);

	const options = [
		...results.map(({ title, duration, url }, index) => ({
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

	const formattedResults = results
		.map(({ title, url, duration }, index) => `\`${index + 1}.\` **[${title}](${url})** | \`${duration}\``)
		.join('\n');

	const initialEmbed = new EmbedBuilder()
		.setTitle(`Search results for \`${query}\``)
		.setDescription(formattedResults)
		.setFooter({ text: "Select 'Cancel' from the selection menu to stop searching." })
		.setColor('Random');

	await interaction.reply({ embeds: [initialEmbed], components: [component], ephemeral: true });

	const selectMenuInteraction = await interaction.channel?.awaitMessageComponent({
		time: 60 * 1000,
		componentType: ComponentType.StringSelect,
		filter: ({ customId, user }: StringSelectMenuInteraction) =>
			customId === uuid && user.id === interaction.user.id,
	});
	if (!selectMenuInteraction) throw new Error('Search timeout.');

	const isMemberInVoiceChannel = (selectMenuInteraction.member as GuildMember).voice.channel;
	if (!isMemberInVoiceChannel) throw new Error('You must be in a voice channel to use the search menu.');

	const isGuildRegistered = Bot.music.has((selectMenuInteraction.guild as Guild).id);
	if (!isGuildRegistered) throw new Error("SerpineBot isn't connected to a voice channel.");

	const { values } = selectMenuInteraction;

	const isSearchInvalidOrCancelled = values.length === 0 || values[0] === 'CANCEL';
	if (isSearchInvalidOrCancelled) {
		const cancelledEmbed = new EmbedBuilder().setTitle('Search has been canceled.').setColor('Random');
		await selectMenuInteraction.update({ embeds: [cancelledEmbed], components: [] });
		return;
	}

	const music = {
		...(await YoutubeApi.search(query, 20)).find(({ url }) => url === values[0])!,
		requested: selectMenuInteraction.user.tag,
	};

	const { position } = await Music.addToQueue(guildId, music);

	const finalEmbed = new EmbedBuilder()
		.setAuthor({ name: 'Added to queue', iconURL: interaction.user.avatarURL() ?? '' })
		.setTitle(music.title)
		.setURL(music.url)
		.setThumbnail(music.thumbnail)
		.addFields([
			{
				name: '**Position in queue**',
				value: position === 0 ? 'Currently playing' : position.toString(),
				inline: true,
			},
			{
				name: '**Channel**',
				value: music.channel ?? 'N/A',
				inline: true,
			},
			{
				name: '**Duration**',
				value: music.duration,
				inline: true,
			},
		])
		.setColor('Random');

	await selectMenuInteraction.update({ embeds: [finalEmbed], components: [] });
};

const pause = async (interaction: ExtendedChatInputCommandInteraction) => {
	const { pausedItem } = await Music.pause(interaction.guild.id);
	const embed = new EmbedBuilder().setTitle(`Pausing \`${pausedItem}\`.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

const resume = async (interaction: ExtendedChatInputCommandInteraction) => {
	const { resumedItem } = await Music.resume(interaction.guild.id);
	const embed = new EmbedBuilder().setTitle(`Pausing \`${resumedItem}\`.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

const seek = async (interaction: ExtendedChatInputCommandInteraction) => {
	const timestamp = interaction.options.getString('timestamp', true);

	await Music.seek(interaction.guild.id, timestamp);
	const embed = new EmbedBuilder().setTitle(`Started playing from \`${timestamp}\`.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

const skip = async (interaction: ExtendedChatInputCommandInteraction) => {
	const { playing, skippedItem } = await Music.skip(interaction.guild.id);

	const embed = new EmbedBuilder()
		.setTitle(`Skipped \`${skippedItem}\`.`)
		.setDescription(`Now playing \`${playing}\`.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const loop = async (interaction: ExtendedChatInputCommandInteraction) => {
	const { looping } = await Music.loop(interaction.guild.id);
	const embed = new EmbedBuilder().setTitle(`Loop has been ${looping ? 'enabled' : 'disabled'}.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};

const queue = async (interaction: ExtendedChatInputCommandInteraction) => {
	const { playing, queue } = Music.queue(interaction.guild.id);

	const formattedQueue = queue
		.slice(0, 10)
		.map(
			({ title, url, duration, requested }, index) =>
				`\`${index + 1}.\` **[${title}](${url})** | **${duration}**\nRequest by \`${requested}\``,
		)
		.join('\n');

	const embed = new EmbedBuilder()
		.setTitle(`Queue for ${interaction.guild.name}`)
		.addFields([
			{
				name: '**Now playing**',
				value: playing
					? `**[${playing.title}](${playing.url})** | **${playing.duration}**\nRequest by \`${playing.requested}\``
					: 'Nothing is playing.',
			},
			{ name: '**Queue**', value: formattedQueue || 'Queue is empty.' },
		])
		.setFooter({ text: `${queue.length} total items in queue.` })
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};
