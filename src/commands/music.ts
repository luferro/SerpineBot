import { SlashCommandBuilder } from '@discordjs/builders';
import {
	CommandInteraction,
	Guild,
	GuildMember,
	MessageActionRow,
	MessageEmbed,
	MessageSelectMenu,
	SelectMenuInteraction,
	TextBasedChannel,
} from 'discord.js';
import { Bot } from '../bot';
import * as Youtube from '../apis/youtube';
import * as Music from '../services/music';

export const data = {
	name: 'music',
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName('music')
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
				.addStringOption((option) => option.setName('time').setDescription('Time <3:20>.').setRequired(true)),
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

export const execute = async (interaction: CommandInteraction) => {
	const member = interaction.member as GuildMember;
	if (!member.voice.channel)
		return await interaction.reply({
			content: 'You must be in a voice channel to use music related commands.',
			ephemeral: true,
		});

	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (interaction: CommandInteraction) => Promise<void>> = {
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

const join = async (interaction: CommandInteraction) => {
	const guild = interaction.guild as Guild;
	const member = interaction.member as GuildMember;

	Music.join(guild.id, member);

	await interaction.reply({ content: 'SerpineBot has joined your voice channel. ', ephemeral: true });
};

const leave = async (interaction: CommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id))
		return await interaction.reply({ content: "SerpineBot isn't connected to a voice channel.", ephemeral: true });

	Music.leave(guild.id);

	await interaction.reply({ content: 'SerpineBot has left your voice channel.', ephemeral: true });
};

const add = async (interaction: CommandInteraction) => {
	const guild = interaction.guild as Guild;
	const member = interaction.member as GuildMember;
	if (!Bot.music.has(guild.id)) Music.join(guild.id, member);

	const query = interaction.options.getString('query')!;
	const results = await Youtube.search(query);

	const music = {
		requested: interaction.user.tag,
		...results[0],
	};

	const result = await Music.addToQueue(guild.id, music).catch((error: Error) => error);
	if (result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

	await interaction.reply({
		embeds: [
			new MessageEmbed()
				.setAuthor({ name: 'Added to queue', iconURL: interaction.user.avatarURL() ?? '' })
				.setTitle(music.title)
				.setURL(music.url)
				.setThumbnail(music.thumbnail ?? '')
				.addField(
					'**Position in queue**',
					result.position === 0 ? 'Currently playing' : result.position.toString(),
					true,
				)
				.addField('**Channel**', music.channel, true)
				.addField('**Duration**', music.duration, true)
				.setColor('RANDOM'),
		],
	});
};

const remove = async (interaction: CommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id))
		return await interaction.reply({ content: "SerpineBot isn't connected to a voice channel.", ephemeral: true });

	const position = interaction.options.getInteger('position')!;

	const result = await Music.removeFromQueue(guild.id, position).catch((error: Error) => error);
	if (result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

	await queue(interaction);
};

const clear = async (interaction: CommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id))
		return await interaction.reply({ content: "SerpineBot isn't connected to a voice channel.", ephemeral: true });

	const result = await Music.clearQueue(guild.id).catch((error: Error) => error);
	if (result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

	await queue(interaction);
};

const search = async (interaction: CommandInteraction) => {
	const guild = interaction.guild as Guild;
	const member = interaction.member as GuildMember;
	if (!Bot.music.has(guild.id)) Music.join(guild.id, member);

	const query = interaction.options.getString('query')!;
	const results = await Youtube.search(query, 10);
	const formattedResults = results
		.map(({ title, url, duration }, index) => `\`${index + 1}.\` **[${title}](${url})** | \`${duration}\``)
		.join('\n');

	const selectOptions = results.map(({ title, duration, url }, index) => ({
		label: `${index + 1}. ${title}`,
		description: duration,
		value: url,
	}));
	selectOptions.push({ label: 'Cancel', description: `Stop searching for ${query}`, value: 'CANCEL' });

	const selectMenu = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId('musicSearchSelectMenu')
			.setPlaceholder('Nothing selected.')
			.addOptions(selectOptions),
	);

	await interaction.reply({
		embeds: [
			new MessageEmbed()
				.setTitle(`Search results for \`${query}\``)
				.setDescription(formattedResults)
				.setFooter({ text: "Select 'Cancel' from the selection menu to stop searching." })
				.setColor('RANDOM'),
		],
		components: [selectMenu],
		ephemeral: true,
	});

	const interactionChannel = interaction.channel as TextBasedChannel;
	const filter = (filterInteraction: SelectMenuInteraction) =>
		filterInteraction.customId === 'musicSearchSelectMenu' && filterInteraction.user.id === interaction.user.id;

	const collector = interactionChannel.createMessageComponentCollector({
		filter,
		componentType: 'SELECT_MENU',
		max: 1,
		time: 60 * 1000,
	});
	await new Promise<void>((resolve, reject) => {
		collector.on('end', async (collected) => {
			try {
				const collectedInteraction = collected.first();
				if (!collectedInteraction) {
					await interaction.editReply({ content: 'Search timeout.', embeds: [], components: [] });
					return;
				}

				const collectedMember = collectedInteraction.member as GuildMember;
				if (!collectedMember.voice.channel) {
					await interaction.editReply({
						content: 'You must be in a voice channel to select an item for the search menu.',
						embeds: [],
						components: [],
					});
					return;
				}

				const collectedGuild = collectedInteraction.guild as Guild;
				if (!Bot.music.has(collectedGuild.id)) {
					await interaction.editReply({
						content: "SerpineBot isn't connected to a voice channel.",
						embeds: [],
						components: [],
					});
					return;
				}

				const { values } = collectedInteraction;
				if (values.length === 0 || values[0] === 'CANCEL') {
					return await collectedInteraction.update({
						embeds: [new MessageEmbed().setTitle('Search has been canceled.').setColor('RANDOM')],
						components: [],
					});
				}

				const results = await Youtube.search(query, 20);
				const selectedMusic = results.find(({ url }) => url === values[0])!;

				const music = {
					requested: collectedInteraction.user.tag,
					...selectedMusic,
				};

				const result = await Music.addToQueue(guild.id, music).catch((error: Error) => error);
				if (result instanceof Error) {
					await interaction.reply({ content: result.message, embeds: [], components: [] });
					return;
				}

				await collectedInteraction.update({
					embeds: [
						new MessageEmbed()
							.setAuthor({ name: 'Added to queue', iconURL: interaction.user.avatarURL() ?? '' })
							.setTitle(music.title)
							.setURL(music.url)
							.setThumbnail(music.thumbnail ?? '')
							.addField(
								'**Position in queue**',
								result.position === 0 ? 'Currently playing' : result.position.toString(),
								true,
							)
							.addField('**Channel**', music.channel, true)
							.addField('**Duration**', music.duration, true)
							.setColor('RANDOM'),
					],
					components: [],
				});

				resolve();
			} catch (error) {
				reject(error);
			}
		});
	});
};

const pause = async (interaction: CommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id))
		return await interaction.reply({ content: "SerpineBot isn't connected to a voice channel.", ephemeral: true });

	const result = await Music.pause(guild.id).catch((error: Error) => error);
	if (result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

	await interaction.reply({
		embeds: [new MessageEmbed().setTitle(`Pausing \`${result.pausedItem}\`.`).setColor('RANDOM')],
	});
};

const resume = async (interaction: CommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id))
		return await interaction.reply({ content: "SerpineBot isn't connected to a voice channel.", ephemeral: true });

	const result = await Music.resume(guild.id).catch((error: Error) => error);
	if (result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

	await interaction.reply({
		embeds: [new MessageEmbed().setTitle(`Pausing \`${result.resumedItem}\`.`).setColor('RANDOM')],
	});
};

const seek = async (interaction: CommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id))
		return await interaction.reply({ content: "SerpineBot isn't connected to a voice channel.", ephemeral: true });

	const time = interaction.options.getString('time')!;

	const result = await Music.seek(guild.id, time).catch((error: Error) => error);
	if (result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

	await interaction.reply({
		embeds: [new MessageEmbed().setTitle(`Started playing from minute \`${time}\`.`).setColor('RANDOM')],
	});
};

const skip = async (interaction: CommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id))
		return await interaction.reply({ content: "SerpineBot isn't connected to a voice channel.", ephemeral: true });

	const result = await Music.skip(guild.id).catch((error: Error) => error);
	if (result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

	await interaction.reply({
		embeds: [
			new MessageEmbed()
				.setTitle(`Skipped \`${result.skippedItem}\`.`)
				.setDescription(`Now playing \`${result.playing}\`.`)
				.setColor('RANDOM'),
		],
	});
};

const loop = async (interaction: CommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id))
		return await interaction.reply({ content: "SerpineBot isn't connected to a voice channel.", ephemeral: true });

	const result = await Music.loop(guild.id).catch((error: Error) => error);
	if (result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

	await interaction.reply({
		embeds: [
			new MessageEmbed()
				.setTitle(result.looping ? 'Loop has been enabled.' : 'Loop has been disabled.')
				.setColor('RANDOM'),
		],
	});
};

const queue = async (interaction: CommandInteraction) => {
	const guild = interaction.guild as Guild;
	if (!Bot.music.has(guild.id))
		return await interaction.reply({ content: "SerpineBot isn't connected to a voice channel.", ephemeral: true });

	const { playing, queue } = Music.queue(guild.id);
	const formattedQueue = queue
		.slice(1, 10)
		.map(
			({ title, url, duration, requested }, index) =>
				`\`${index + 1}.\` **[${title}](${url})** | \`${duration}\`\nRequest by \`${requested}\``,
		)
		.join('\n');

	await interaction.reply({
		embeds: [
			new MessageEmbed()
				.setTitle(`Queue for ${guild.name}`)
				.addField(
					'Now playing',
					playing
						? `**[${playing.title}](${playing.url})** | \`${playing.duration}\`\nRequest by \`${playing.requested}\``
						: 'Nothing is playing.',
				)
				.addField('Queue', formattedQueue || 'Queue is empty.')
				.setFooter({ text: `${playing ? queue.length - 1 : queue.length} total items in queue.` })
				.setColor('RANDOM'),
		],
	});
};
