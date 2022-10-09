import type { ChatInputCommandInteraction, Guild, GuildMember, SelectMenuInteraction } from 'discord.js';
import { ActionRowBuilder, ComponentType, EmbedBuilder, SelectMenuBuilder, SlashCommandBuilder } from 'discord.js';
import { YoutubeApi } from '@luferro/google-api';
import { Bot } from '../structures/bot';
import * as Music from '../services/music';
import { CommandName } from '../types/enums';

export const data = {
	name: CommandName.Music,
	isClientRequired: false,
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

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const member = interaction.member as GuildMember;
	if (!member.voice.channel) throw new Error('You must be in a voice channel to use music related commands.');

	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (arg0: ChatInputCommandInteraction) => Promise<void>> = {
		join: join,
		leave: leave,
		play: add,
		remove: remove,
		clear: clear,
		search: search,
		pause: pause,
		resume: resume,
		seek: seek,
		skip: skip,
		loop: loop,
		queue: queue,
	};

	await select[subcommand](interaction);
};

const join = async (interaction: ChatInputCommandInteraction) => {
	const guild = interaction.guild as Guild;
	const member = interaction.member as GuildMember;
	if (Bot.music.has(guild.id)) throw new Error('SerpineBot is already connect to a voice channel.');

	Music.join(guild.id, member);

	await interaction.reply({ content: 'SerpineBot has joined your voice channel. ', ephemeral: true });
};

const leave = async (interaction: ChatInputCommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id)) throw new Error("SerpineBot isn't connected to a voice channel.");

	Music.leave(guild.id);

	await interaction.reply({ content: 'SerpineBot has left your voice channel.', ephemeral: true });
};

const add = async (interaction: ChatInputCommandInteraction) => {
	const guild = interaction.guild as Guild;
	const member = interaction.member as GuildMember;
	if (!Bot.music.has(guild.id)) Music.join(guild.id, member);

	const query = interaction.options.getString('query', true);

	const isPlaylist = await YoutubeApi.isPlaylist(query);
	if (isPlaylist) {
		const { title, url, channel, count, videos } = await YoutubeApi.getPlaylist(query);
		for (const video of videos) {
			const music = {
				playlist: {
					title,
					url,
				},
				requested: interaction.user.tag,
				...video,
			};

			await Music.addToQueue(guild.id, music).catch((error: Error) => error);
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
		requested: interaction.user.tag,
		...data,
	};

	const { position } = await Music.addToQueue(guild.id, music);

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

const remove = async (interaction: ChatInputCommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id)) throw new Error("SerpineBot isn't connected to a voice channel.");

	const position = interaction.options.getInteger('position', true);
	await Music.removeFromQueue(guild.id, position);

	await queue(interaction);
};

const clear = async (interaction: ChatInputCommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id)) throw new Error("SerpineBot isn't connected to a voice channel.");

	await Music.clearQueue(guild.id);

	await queue(interaction);
};

const search = async (interaction: ChatInputCommandInteraction) => {
	const guild = interaction.guild as Guild;
	const member = interaction.member as GuildMember;
	if (!Bot.music.has(guild.id)) Music.join(guild.id, member);

	const query = interaction.options.getString('query', true);
	const results = await YoutubeApi.search(query, 10);

	const formattedResults = results
		.map(({ title, url, duration }, index) => `\`${index + 1}.\` **[${title}](${url})** | \`${duration}\``)
		.join('\n');

	const selectOptions = results.map(({ title, duration, url }, index) => ({
		label: `${index + 1}. ${title}`,
		description: duration,
		value: url,
	}));
	selectOptions.push({ label: 'Cancel', description: `Stop searching for ${query}`, value: 'CANCEL' });

	const selectMenu = new SelectMenuBuilder()
		.setCustomId('musicSearchSelectMenu')
		.setPlaceholder('Nothing selected.')
		.addOptions(selectOptions);

	const actionRow = new ActionRowBuilder().addComponents(selectMenu) as ActionRowBuilder<SelectMenuBuilder>;

	const embed = new EmbedBuilder()
		.setTitle(`Search results for \`${query}\``)
		.setDescription(formattedResults)
		.setFooter({ text: "Select 'Cancel' from the selection menu to stop searching." })
		.setColor('Random');

	await interaction.reply({ embeds: [embed], components: [actionRow], ephemeral: true });

	const filter = (filterInteraction: SelectMenuInteraction) =>
		filterInteraction.customId === 'musicSearchSelectMenu' && filterInteraction.user.id === interaction.user.id;

	const collector = interaction.channel?.createMessageComponentCollector({
		filter,
		componentType: ComponentType.SelectMenu,
		max: 1,
		time: 60 * 1000,
	});
	collector?.on('end', async (collected) => {
		try {
			const collectedInteraction = collected.first();
			if (!collectedInteraction) throw new Error('Search timeout.');

			const collectedMember = collectedInteraction.member as GuildMember;
			if (!collectedMember.voice.channel)
				throw new Error('You must be in a voice channel to select an item from the search menu.');

			const collectedGuild = collectedInteraction.guild as Guild;
			if (!Bot.music.has(collectedGuild.id)) throw new Error("SerpineBot isn't connected to a voice channel.");

			const { values } = collectedInteraction;
			if (values.length === 0 || values[0] === 'CANCEL') {
				const embed = new EmbedBuilder().setTitle('Search has been canceled.').setColor('Random');

				await collectedInteraction.update({ embeds: [embed], components: [] });
				return;
			}

			const results = await YoutubeApi.search(query, 20);
			const selectedMusic = results.find(({ url }) => url === values[0])!;

			const music = {
				requested: collectedInteraction.user.tag,
				...selectedMusic,
			};

			const { position } = await Music.addToQueue(guild.id, music);

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

			await collectedInteraction.update({ embeds: [embed], components: [] });
		} catch (error) {
			await interaction[interaction.replied ? 'editReply' : 'reply']({
				content: (error as Error).message,
				embeds: [],
				components: [],
			});
		}
	});
};

const pause = async (interaction: ChatInputCommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id)) throw new Error("SerpineBot isn't connected to a voice channel.");

	const { pausedItem } = await Music.pause(guild.id);

	const embed = new EmbedBuilder().setTitle(`Pausing \`${pausedItem}\`.`).setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const resume = async (interaction: ChatInputCommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id)) throw new Error("SerpineBot isn't connected to a voice channel.");

	const { resumedItem } = await Music.resume(guild.id);

	const embed = new EmbedBuilder().setTitle(`Pausing \`${resumedItem}\`.`).setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const seek = async (interaction: ChatInputCommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id)) throw new Error("SerpineBot isn't connected to a voice channel.");

	const timestamp = interaction.options.getString('timestamp', true);
	await Music.seek(guild.id, timestamp);

	const embed = new EmbedBuilder().setTitle(`Started playing from minute \`${timestamp}\`.`).setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const skip = async (interaction: ChatInputCommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id)) throw new Error("SerpineBot isn't connected to a voice channel.");

	const { playing, skippedItem } = await Music.skip(guild.id);

	const embed = new EmbedBuilder()
		.setTitle(`Skipped \`${skippedItem}\`.`)
		.setDescription(`Now playing \`${playing}\`.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const loop = async (interaction: ChatInputCommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id)) throw new Error("SerpineBot isn't connected to a voice channel.");

	const { looping } = await Music.loop(guild.id);

	const embed = new EmbedBuilder().setTitle(`Loop has been ${looping ? 'enabled' : 'disabled'}.`).setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const queue = async (interaction: ChatInputCommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id)) throw new Error("SerpineBot isn't connected to a voice channel.");

	const { playing, queue } = Music.queue(guild.id);
	const formattedQueue = queue
		.slice(0, 10)
		.map(
			({ title, url, duration, requested }, index) =>
				`\`${index + 1}.\` **[${title}](${url})** | **${duration}**\nRequest by \`${requested}\``,
		)
		.join('\n');

	const embed = new EmbedBuilder()
		.setTitle(`Queue for ${guild.name}`)
		.setDescription(
			`**Now playing**\n${
				playing
					? `**[${playing.title}](${playing.url})** | **${playing.duration}**\nRequest by \`${playing.requested}\``
					: 'Nothing is playing.'
			}\n\n**Queue**\n${formattedQueue || 'Queue is empty.'}`,
		)
		.setFooter({ text: `${queue.length} total items in queue.` })
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};
