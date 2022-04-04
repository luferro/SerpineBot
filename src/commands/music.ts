import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Guild, GuildMember, MessageActionRow, MessageEmbed, MessageSelectMenu, SelectMenuInteraction, TextBasedChannel } from 'discord.js';
import { Bot } from '../bot';
import * as Youtube from '../apis/youtube';
import * as Music from '../services/music';
import { InteractionError } from '../errors/interactionError';

export const data = {
    name: 'music',
    client: true,
    slashCommand: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Music related commands.')
        .addSubcommand(subcommand => subcommand.setName('join').setDescription('Bot joins the voice channel you\'re in.'))
        .addSubcommand(subcommand => subcommand.setName('leave').setDescription('Bot leaves the voice channel.'))
        .addSubcommand(subcommand => subcommand.setName('skip').setDescription('Skips the current item playing.'))
        .addSubcommand(subcommand => subcommand.setName('pause').setDescription('Pauses the current item playing.'))
        .addSubcommand(subcommand => subcommand.setName('resume').setDescription('Resumes paused item.'))
        .addSubcommand(subcommand => subcommand.setName('loop').setDescription('Sets the current item in loop.'))
        .addSubcommand(subcommand => subcommand.setName('queue').setDescription('Lists the current queue.'))
        .addSubcommand(subcommand => subcommand.setName('clear').setDescription('Removes every item in the queue.'))
        .addSubcommand(subcommand => subcommand.setName('play').setDescription('Plays the first result matching your search query.')
            .addStringOption(option => option.setName('query').setDescription('Youtube search query.').setRequired(true))
        )
        .addSubcommand(subcommand => subcommand.setName('search').setDescription('Search the top 10 results for a given query.')
            .addStringOption(option => option.setName('query').setDescription('Youtube search query.').setRequired(true))
        )
        .addSubcommand(subcommand => subcommand.setName('seek').setDescription('Jump to a given minute.')
            .addStringOption(option => option.setName('time').setDescription('Time <3:20>.').setRequired(true))
        )
        .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Removes an item from the queue matching a given position.')
            .addIntegerOption(option => option.setName('position').setDescription('Position in the queue of the item you wish to remove.').setRequired(true))
        )
}

export const execute = async (client: Bot, interaction: CommandInteraction) => {
    const member = interaction.member as GuildMember;
    if(!member.voice.channel) throw new InteractionError('You must be in a voice channel to use music related commands.');
    
    const subcommand = interaction.options.getSubcommand();

    const select: Record<string, Function> = {
        'join': join,
        'leave': leave,
        'play': add,
        'remove': remove,
        'clear': clear,
        'search': search,
        'pause': pause,
        'resume': resume,
        'seek': seek,
        'skip': skip,
        'loop': loop,
        'queue': queue
    }
    
    await select[subcommand](client, interaction);
}

const join = async (client: Bot, interaction: CommandInteraction) => {
    const guild = interaction.guild as Guild;
    const member = interaction.member as GuildMember;

    Music.join(client, guild.id, member);

    await interaction.reply({ content: 'SerpineBot has joined your voice channel. ', ephemeral: true });
}

const leave = async (client: Bot, interaction: CommandInteraction) => {
    const guild = interaction.guild as Guild;
    if(!client.music.has(guild.id)) throw new InteractionError('SerpineBot isn\'t connected to a voice channel.');

    Music.leave(client, guild.id);

    await interaction.reply({ content: 'SerpineBot has left your voice channel.', ephemeral: true });
}

const add = async (client: Bot, interaction: CommandInteraction) => {
    const guild = interaction.guild as Guild;
    const member = interaction.member as GuildMember;
    if(!client.music.has(guild.id)) Music.join(client, guild.id, member);

    const query = interaction.options.getString('query')!;
    const results = await Youtube.search(query);

    const music = {
        requested: interaction.user.tag,
		...results[0]
	};

    const { position } = await Music.addToQueue(client, guild.id, music).catch(error => {
        throw new InteractionError(error.message);
    });

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setAuthor({ name: 'Added to queue', iconURL: interaction.user.avatarURL() ?? '' })
			.setTitle(music.title)
			.setURL(music.url)
			.setThumbnail(music.thumbnail ?? '')
			.addField('**Position in queue**', position === 0 ? 'Currently playing' : position.toString(), true)
			.addField('**Channel**', music.channel, true)
			.addField('**Duration**', music.duration, true)
			.setColor('RANDOM')
	]});
}

const remove = async (client: Bot, interaction: CommandInteraction) => {
    const guild = interaction.guild as Guild;
    if(!client.music.has(guild.id)) throw new InteractionError('SerpineBot isn\'t connected to a voice channel.');

    const position = interaction.options.getInteger('position')!;
    await Music.removeFromQueue(client, guild.id, position).catch(error => {
        throw new InteractionError(error.message);
    });

    await queue(client, interaction);
}

const clear = async (client: Bot, interaction: CommandInteraction) => {
    const guild = interaction.guild as Guild;
    if(!client.music.has(guild.id)) throw new InteractionError('SerpineBot isn\'t connected to a voice channel.');

    await Music.clearQueue(client, guild.id).catch(error => {
        throw new InteractionError(error.message);
    });

    await queue(client, interaction);
}

const search = async (client: Bot, interaction: CommandInteraction) => {
    const guild = interaction.guild as Guild;
    const member = interaction.member as GuildMember;
    if(!client.music.has(guild.id)) Music.join(client, guild.id, member);

    const query = interaction.options.getString('query')!;
    const results = await Youtube.search(query, 10);
    const formattedResults = results.map((item, index) => `\`${index + 1}.\` **[${item.title}](${item.url})** | \`${item.duration}\``);

    const selectOptions = results.map((item, index) => ({ label: `${index + 1}. ${item.title}`, description: item.duration, value: item.url }));
    selectOptions.push({ label: 'Cancel', description: `Stop searching for ${query}`, value: 'CANCEL' });

    const selectMenu = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId('musicSearchSelectMenu')
			.setPlaceholder('Nothing selected.')
			.addOptions(selectOptions)
	);

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Search results for \`${query}\``)
			.setDescription(formattedResults.join('\n'))
			.setFooter({ text: 'Select \'Cancel\' from the selection menu to stop searching.' })
			.setColor('RANDOM')
	], components: [selectMenu], ephemeral: true });

    const interactionChannel = interaction.channel as TextBasedChannel;
	const filter = (filterInteraction: SelectMenuInteraction) => filterInteraction.customId === 'musicSearchSelectMenu' && filterInteraction.user.id === interaction.user.id;
	
    const collector = interactionChannel.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', max: 1, time: 60 * 1000 });
    await new Promise<void>((resolve, reject) => {
        collector.on('end', async (collected) => {
            try {
                const collectedInteraction = collected.first();
                if(!collectedInteraction) throw new InteractionError('Search timeout.');
        
                const collectedMember = collectedInteraction.member as GuildMember;
                if(!collectedMember.voice.channel) throw new InteractionError('You must be in a voice channel to select an item for the search menu.');

                const collectedGuild = collectedInteraction.guild as Guild;
                if(!client.music.has(collectedGuild.id)) throw new InteractionError('SerpineBot isn\'t connected to a voice channel.');
        
                const { values } = collectedInteraction;
                if(values.length === 0 || values[0] === 'CANCEL')  {
                    return await collectedInteraction.update({ embeds: [
                        new MessageEmbed()
                            .setTitle('Search has been canceled.')
                            .setColor('RANDOM')
                    ], components: [] });
                }
        
                const results = await Youtube.search(query, 20);
                const selectedMusic = results.find(item => item.url === values[0])!;
        
                const music = {
                    requested: collectedInteraction.user.tag,
                    ...selectedMusic
                };
        
                const { position } = await Music.addToQueue(client, guild.id, music).catch(error => {
                    throw new InteractionError(error.message);
                });
        
                await collectedInteraction.update({ embeds: [
                    new MessageEmbed()
                        .setAuthor({ name: 'Added to queue', iconURL: interaction.user.avatarURL() ?? '' })
                        .setTitle(music.title)
                        .setURL(music.url)
                        .setThumbnail(music.thumbnail ?? '')
                        .addField('**Position in queue**', position === 0 ? 'Currently playing' : position.toString(), true)
                        .addField('**Channel**', music.channel, true)
                        .addField('**Duration**', music.duration, true)
                        .setColor('RANDOM')
                ], components: [] });
                
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
}

const pause = async (client: Bot, interaction: CommandInteraction) => {
    const guild = interaction.guild as Guild;
    if(!client.music.has(guild.id)) throw new InteractionError('SerpineBot isn\'t connected to a voice channel.');

    const { pausedItem } = await Music.pause(client, guild.id).catch(error => {
        throw new InteractionError(error.message);
    });

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Pausing \`${pausedItem}\`.`)
			.setColor('RANDOM')
	]});
}

const resume = async (client: Bot, interaction: CommandInteraction) => {
    const guild = interaction.guild as Guild;
    if(!client.music.has(guild.id)) throw new InteractionError('SerpineBot isn\'t connected to a voice channel.');

    const { resumedItem } = await Music.resume(client, guild.id).catch(error => {
        throw new InteractionError(error.message);
    });

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Pausing \`${resumedItem}\`.`)
			.setColor('RANDOM')
	]});
}

const seek = async (client: Bot, interaction: CommandInteraction) => {
    const guild = interaction.guild as Guild;
    if(!client.music.has(guild.id)) throw new InteractionError('SerpineBot isn\'t connected to a voice channel.');

    const time = interaction.options.getString('time')!;
    await Music.seek(client, guild.id, time).catch(error => {
        throw new InteractionError(error.message);
    });
    
    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Started playing from minute \`${time}\`.`)
			.setColor('RANDOM')
	]});
}

const skip = async (client: Bot, interaction: CommandInteraction) => {
    const guild = interaction.guild as Guild;
    if(!client.music.has(guild.id)) throw new InteractionError('SerpineBot isn\'t connected to a voice channel.');

    const { skippedItem, playing } = await Music.skip(client, guild.id).catch(error => {
        throw new InteractionError(error.message);
    });

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Skipped \`${skippedItem}\`.`)
            .setDescription(`Now playing \`${playing}\`.`)
			.setColor('RANDOM')
	]});
}

const loop = async (client: Bot, interaction: CommandInteraction) => {
    const guild = interaction.guild as Guild;
    if(!client.music.has(guild.id)) throw new InteractionError('SerpineBot isn\'t connected to a voice channel.');

    const { looping } = await Music.loop(client, guild.id).catch(error => {
        throw new InteractionError(error.message);
    });

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(looping ? 'Loop has been enabled.' : 'Loop has been disabled.')
			.setColor('RANDOM')
	]});
}

const queue = async (client: Bot, interaction: CommandInteraction) => {
    const guild = interaction.guild as Guild;
    if(!client.music.has(guild.id)) throw new InteractionError('SerpineBot isn\'t connected to a voice channel.');

    const { playing, queue } = Music.queue(client, guild.id);
    const formattedQueue = queue.slice(1, 10).map((item, index) => `\`${index + 1}.\` **[${item.title}](${item.url})** | \`${item.duration}\`\nRequest by \`${item.requested}\``);

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Queue for ${guild.name}`)
			.addField('Now playing', playing ? `**[${playing.title}](${playing.url})** | \`${playing.duration}\`\nRequest by \`${playing.requested}\`` : 'Nothing is playing.')
            .addField('Queue', formattedQueue.length > 0 ? formattedQueue.join('\n') : 'Queue is empty.')
            .setFooter({ text: `${playing ? queue.length - 1 : queue.length} total items in queue.` })
			.setColor('RANDOM')
	]});
}