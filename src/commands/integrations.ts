import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as Integrations from '../services/integrations';

export const data = {
    name: 'integrations',
    client: false,
    slashCommand: new SlashCommandBuilder()
        .setName('integrations')
        .setDescription('Bot integrations related commands.')
        .addSubcommand(subcommand => subcommand.setName('sync').setDescription('Synchronizes an integration manually.'))
        .addSubcommand(subcommand => subcommand.setName('delete').setDescription('Deletes an integration.'))
        .addSubcommand(subcommand => subcommand.setName('import').setDescription('Adds an integration.')
            .addStringOption(option => option.setName('url').setDescription('Profile account URL.').setRequired(true))
        )
        .addSubcommand(subcommand => subcommand.setName('notifications').setDescription('Turns an integration notifications on or off.')
            .addBooleanOption(option => option.setName('option').setDescription('Option as a boolean.').setRequired(true))
        )
}

export const execute = async (interaction: CommandInteraction) => {
    const subcommand = interaction.options.getSubcommand();

    const select: Record<string, Function> = {
        'sync': syncIntegration,
        'import': addIntegration,
        'delete': deleteIntegration,
        'notifications': integrationNotifications
    }
    
    await select[subcommand](interaction);
}

const addIntegration = async (interaction: CommandInteraction) => {
    const url = interaction.options.getString('url')!;

    const result = await Integrations.create(interaction.user.id, url).catch((error: Error) => error);
    if(result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam profile imported successfully!')
            .setColor('RANDOM')
    ], ephemeral: true });
}

const syncIntegration = async (interaction: CommandInteraction) => {
    const result = await Integrations.sync(interaction.user.id).catch((error: Error) => error);
    if(result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam wishlist synced successfully!')
            .setColor('RANDOM')
    ], ephemeral: true });
}

const integrationNotifications = async (interaction: CommandInteraction) => {
    const option = interaction.options.getBoolean('option')!;
    
    const result = await Integrations.notifications(interaction.user.id, option).catch((error: Error) => error);
    if(result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`Steam integration notifications have been turned ${option ? 'on' : 'off'}!`)
            .setColor('RANDOM')
    ], ephemeral: true });
}

const deleteIntegration = async (interaction: CommandInteraction) => {
    const result = await Integrations.remove(interaction.user.id).catch((error: Error) => error);
    if(result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam integration deleted successfully!')
            .setColor('RANDOM')
    ], ephemeral: true });
}