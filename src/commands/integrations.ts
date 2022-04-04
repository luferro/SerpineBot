import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as Integrations from '../services/integrations';
import { InteractionError } from '../errors/interactionError';

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

    await Integrations.addIntegration(interaction.user.id, url).catch(error => {
        throw new InteractionError(error.message);
    });

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam profile imported successfully!')
            .setColor('RANDOM')
    ], ephemeral: true });
}

const syncIntegration = async (interaction: CommandInteraction) => {
    await Integrations.syncIntegration(interaction.user.id).catch(error => {
        throw new InteractionError(error.message);
    });

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam wishlist synced successfully!')
            .setColor('RANDOM')
    ], ephemeral: true });
}

const integrationNotifications = async (interaction: CommandInteraction) => {
    const option = interaction.options.getBoolean('option')!;
    
    await Integrations.updateNotifications(interaction.user.id, option).catch(error => {
        throw new InteractionError(error.message);
    });

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`Steam integration notifications have been turned ${option ? 'on' : 'off'}!`)
            .setColor('RANDOM')
    ], ephemeral: true });
}

const deleteIntegration = async (interaction: CommandInteraction) => {
    await Integrations.deleteIntegration(interaction.user.id).catch(error => {
        throw new InteractionError(error.message);
    });

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam integration deleted successfully!')
            .setColor('RANDOM')
    ], ephemeral: true });
}