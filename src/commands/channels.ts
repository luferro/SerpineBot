import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Guild, MessageActionRow, MessageEmbed, MessageSelectMenu, SelectMenuInteraction, TextChannel, VoiceChannel } from 'discord.js';
import * as RolesJob from '../jobs/roles';
import * as Channels from '../services/channels';
import { ChannelCategories, MessageCategories } from '../types/categories';
import { InteractionError } from '../errors/interactionError';

export const data = {
    name: 'channels',
    client: false,
    slashCommand: new SlashCommandBuilder()
        .setName('channels')
        .setDescription('Channels related commands.')
        .setDefaultPermission(false)
        .addSubcommand(subcommand => subcommand.setName('create').setDescription('Create a guild channel.')
            .addStringOption(option => option.setName('name').setDescription('Channel name.').setRequired(true))
            .addStringOption(option => option.setName('type').setDescription('Whether it should be a text or voice channel.').setRequired(true)
                .addChoice('Text Channel', 'GUILD_TEXT')
                .addChoice('Voice Channel', 'GUILD_VOICE')
            )
            .addStringOption(option => option.setName('topic').setDescription('Topic of the text channel.'))
            .addBooleanOption(option => option.setName('nsfw').setDescription('Whether the channel is NSFW.'))
        )
        .addSubcommand(subcommand => subcommand.setName('update').setDescription('Update a guild channel.')
            .addChannelOption(option => option.setName('channel').setDescription('Guild channel.').setRequired(true))
            .addStringOption(option => option.setName('name').setDescription('Channel name.'))
            .addStringOption(option => option.setName('topic').setDescription('Topic of the text channel.'))
            .addBooleanOption(option => option.setName('nsfw').setDescription('Whether the channel is NSFW.'))
        )
        .addSubcommand(subcommand => subcommand.setName('delete').setDescription('Delete a guild channel.')
            .addChannelOption(option => option.setName('channel').setDescription('Guild channel.').setRequired(true))
        )
        .addSubcommand(subcommand => subcommand.setName('assign').setDescription('Assign a bot message to a text channel.')
            .addStringOption(option => option.setName('category').setDescription('Message category.').setRequired(true)
                .addChoice('Roles', 'ROLES_MESSAGE')
                .addChoice('Leaderboards', 'LEADERBOARDS_MESSAGE')
                .addChoice('Birthdays', 'BIRTHDAYS_MESSAGE')
            )
            .addChannelOption(option => option.setName('channel').setDescription('Text channel to receive bot message.').setRequired(true))
        )
        .addSubcommand(subcommand => subcommand.setName('dissociate').setDescription('Dissociate a bot message from a text channel.')
            .addStringOption(option => option.setName('category').setDescription('Message category.').setRequired(true)
                .addChoice('Roles', 'ROLES_MESSAGE')
                .addChoice('Leaderboards', 'LEADERBOARDS_MESSAGE')
                .addChoice('Birthdays', 'BIRTHDAYS_MESSAGE')
            )
            .addChannelOption(option => option.setName('channel').setDescription('Text channel which has the bot message assigned.').setRequired(true))
        )
}

export const execute = async (interaction: CommandInteraction) => {
    const subcommand = interaction.options.getSubcommand();

    const select = async (category: string) => {
        const options: Record<string, Function> = {
            'create': createChannel,
            'update': updateChannel,
            'delete': deleteChannel,
            'assign': assignChannel,
            'dissociate': dissociateChannel
        };
        return options[category](interaction);
    };
    await select(subcommand);
}

const getRoleOptions = (guild: Guild) => {
    const roles = [...guild.roles.cache.values()].sort((a, b) => a.position - b.position);
    return roles.map(item => {
        if(item.id === guild.roles.everyone.id || item.tags) return;

        return {
            label: item.name,
            value: item.id
        }
    }).filter((item): item is NonNullable<typeof item> => !!item);
}

const getLeaderboardOptions = () => {
    const leaderboards = ['Steam'];
    return leaderboards.map(item => ({ label: item, value: item }));
}

const createChannel = async (interaction: CommandInteraction) => {
    const name = interaction.options.getString('name')!;
    const type = interaction.options.getString('type')! as ChannelCategories;
    const topic = interaction.options.getString('topic') ?? '';
    const nsfw = interaction.options.getBoolean('nsfw') ?? false;

    const guild = interaction.guild as Guild;
    await Channels.create(guild, name, type, topic, nsfw);

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Channel ${name} has been created.`)
			.setColor('RANDOM')
	], ephemeral: true });
}

const updateChannel = async (interaction: CommandInteraction) => {
    const channel = interaction.options.getChannel('channel')!;
    const name = interaction.options.getString('name')!;
    const topic = interaction.options.getString('topic');
    const nsfw = interaction.options.getBoolean('nsfw');
    
    const isValid = channel instanceof TextChannel || channel instanceof VoiceChannel;
    if(!isValid) throw new InteractionError('Channel must be a text or voice channel.');

    await Channels.update(channel, name, topic, nsfw);

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Channel ${channel.name} has been updated.`)
			.setColor('RANDOM')
	], ephemeral: true });
}

const deleteChannel = async (interaction: CommandInteraction) => {
    const channel = interaction.options.getChannel('channel');

    const isValid = channel instanceof TextChannel || channel instanceof VoiceChannel;
    if(!isValid) throw new InteractionError('Channel must be a text or voice channel.');

    const { name } = channel;
    await Channels.remove(channel);

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Channel ${name} has been deleted.`)
			.setColor('RANDOM')
	], ephemeral: true });
}

const assignChannel = async (interaction: CommandInteraction) => {
    const channel = interaction.options.getChannel('channel')!;
    const category = interaction.options.getString('category')! as MessageCategories;

    const isValid = channel instanceof TextChannel;
    if(!isValid) throw new InteractionError('Channel must be a text channel.');

    const guild = interaction.guild as Guild;
    if(category === 'BIRTHDAYS_MESSAGE') {
        await Channels.assign(guild.id, channel, category, []);

        return await interaction.reply({ embeds: [
            new MessageEmbed()
                .setTitle(`${category} has been assigned to ${channel.name}.`)
                .setColor('RANDOM')
        ], ephemeral: true });
    }

    const select: Record<string, Function> = {
        'ROLES_MESSAGE': getRoleOptions,
        'LEADERBOARDS_MESSAGE': getLeaderboardOptions
    }

    const options = select[category]();
    if(options.length === 0) throw new InteractionError(`Invalid length of options for ${category}`);

    const selectMenu = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId(`ASSIGN_${category}`)
			.setPlaceholder('Nothing selected.')
            .setMaxValues(options.length)
			.addOptions(options)
	);

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Select which actions should be included in the ${category}.`)
			.setColor('RANDOM')
	], components: [selectMenu], ephemeral: true });

    const interactionChannel = interaction.channel as TextChannel;
    const filter = (filterInteraction: SelectMenuInteraction) => filterInteraction.customId === `ASSIGN_${category}` && filterInteraction.user.id === interaction.user.id;

	const collector = interactionChannel.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', max: 1, time: 60 * 1000 * 5 });
    await new Promise<void>((resolve, reject) => {
        collector.on('end', async collected => {
            try {
                const collectedInteraction = collected.first();
                if(!collectedInteraction) throw new InteractionError('Channel assign timeout.');
        
                await Channels.assign(guild.id, channel, category, collectedInteraction.values);
        
                collectedInteraction.update({ embeds: [
                    new MessageEmbed()
                        .setTitle(`${category} has been assigned to ${channel.name}.`)
                        .setColor('RANDOM')
                ], components: [] });

                if(category === 'ROLES_MESSAGE') await RolesJob.execute(collectedInteraction.client);
            } catch (error) {
                reject(error);
            }
        });
    });
}

const dissociateChannel = async (interaction: CommandInteraction) => {
    const channel = interaction.options.getChannel('channel')!;
    const category = interaction.options.getString('category')! as MessageCategories;

    const isValid = channel instanceof TextChannel;
    if(!isValid) throw new InteractionError('Channel must be a text channel.');

    const guild = interaction.guild as Guild;
    if(category === 'ROLES_MESSAGE' || category === 'BIRTHDAYS_MESSAGE') {
        await Channels.dissociate(guild.id, channel, category, []).catch(error => {
            throw new InteractionError(error.message);
        });

        return await interaction.reply({ embeds: [
            new MessageEmbed()
                .setTitle(`${category} has been dissociated from ${channel.name}.`)
                .setColor('RANDOM')
        ], ephemeral: true });
    }

    const options = getLeaderboardOptions();
    if(options.length === 0) throw new InteractionError(`Invalid length of options for ${category}`);

    const selectMenu = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId(`DISSOCIATE_${category}`)
			.setPlaceholder('Nothing selected.')
            .setMaxValues(options.length)
			.addOptions(options)
	);

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Select which actions should be excluded from the ${category} in channel ${channel.name}.`)
			.setColor('RANDOM')
	], components: [selectMenu], ephemeral: true });

    const interactionChannel = interaction.channel as TextChannel;
    const filter = (filterInteraction: SelectMenuInteraction) => filterInteraction.customId === `DISSOCIATE_${category}` && filterInteraction.user.id === interaction.user.id;

	const collector = interactionChannel.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', max: 1, time: 60 * 1000 * 5 });
    await new Promise<void>((resolve, reject) => {
        try {
            collector.on('end', async collected => {
                const collectedInteraction = collected.first();
                if(!collectedInteraction) throw new InteractionError('Channel dissociate timeout.');
    
                await Channels.dissociate(guild.id, channel, category, collectedInteraction.values).catch(error => {
                    throw new InteractionError(error.message);
                });
        
                await collectedInteraction.update({ embeds: [
                    new MessageEmbed()
                        .setTitle(`${category} has been dissociated from ${channel.name}.`)
                        .setColor('RANDOM')
                ], components: [] });
            });

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}