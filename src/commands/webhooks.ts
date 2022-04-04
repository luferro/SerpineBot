import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Guild, GuildBasedChannel, MessageEmbed, TextChannel } from 'discord.js';
import { Bot } from '../bot';
import * as Webhooks from '../services/webhooks';
import { WebhookCategories } from '../types/categories';
import { InteractionError } from '../errors/interactionError';

export const data = {
    name: 'webhooks',
    client: true,
    slashCommand: new SlashCommandBuilder()
        .setName('webhooks')
        .setDescription('Webhooks related commands.')
        .setDefaultPermission(false)
        .addSubcommand(subcommand => subcommand.setName('create').setDescription('Create a webhook and assign it to a text channel.')
            .addStringOption(option => option.setName('category').setDescription('Webhook category.').setRequired(true)
                .addChoice('NSFW', 'NSFW')
                .addChoice('Memes', 'Memes')
                .addChoice('Anime', 'Anime')
                .addChoice('Manga', 'Manga')
                .addChoice('World News', 'World News')
                .addChoice('Gaming News', 'Gaming News')
                .addChoice('Reviews', 'Reviews')
                .addChoice('Deals', 'Deals')
                .addChoice('Free Games', 'Free Games')
                .addChoice('Xbox', 'Xbox')
                .addChoice('Playstation', 'Playstation')
                .addChoice('Nintendo', 'Nintendo')
            )
            .addChannelOption(option => option.setName('channel').setDescription('Text channel to receive webhook content.').setRequired(true))
        )
        .addSubcommand(subcommand => subcommand.setName('delete').setDescription('Delete a webhook.')
            .addStringOption(option => option.setName('category').setDescription('Webhook category.').setRequired(true)
                .addChoice('NSFW', 'NSFW')
                .addChoice('Memes', 'Memes')
                .addChoice('Anime', 'Anime')
                .addChoice('Manga', 'Manga')
                .addChoice('World News', 'World News')
                .addChoice('Gaming News', 'Gaming News')
                .addChoice('Reviews', 'Reviews')
                .addChoice('Deals', 'Deals')
                .addChoice('Free Games', 'Free Games')
                .addChoice('Xbox', 'Xbox')
                .addChoice('Playstation', 'Playstation')
                .addChoice('Nintendo', 'Nintendo')
            )
        )
}

export const execute = async (client: Bot, interaction: CommandInteraction) => {
    const subcommand = interaction.options.getSubcommand();

    const select = (category: string) => {
        const options: Record<string, Function> = {
            'create': createWebhook,
            'delete': deleteWebhook
        }
        return options[category](client, interaction);
    }
    await select(subcommand);
}

const createWebhook = async (client: Bot, interaction: CommandInteraction) => {
    const category = interaction.options.getString('category')! as WebhookCategories;
    const channel = interaction.options.getChannel('channel')! as GuildBasedChannel;
    if(channel.type !== 'GUILD_TEXT') throw new InteractionError('Webhooks can only be assigned to text channels.');

    const guild = interaction.guild as Guild;
    const textChannel = channel as TextChannel;

    await Webhooks.create(guild.id, textChannel, category).catch(error => { throw new InteractionError(error.message) });

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`${category} webhook has been assigned to ${channel.name}.`)
            .setColor('RANDOM')
    ]});
}

const deleteWebhook = async (client: Bot, interaction: CommandInteraction) => {
    const category = interaction.options.getString('category')! as WebhookCategories;
    const guild = interaction.guild as Guild;

    await Webhooks.remove(client, guild.id, category).catch(error => { throw new InteractionError(error.message) });

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`${category} webhook has been deleted.`)
            .setColor('RANDOM')
    ]});
}