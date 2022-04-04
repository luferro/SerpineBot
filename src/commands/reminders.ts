import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as Reminders from '../services/reminders';
import { TimeUnits } from '../types/categories';
import { InteractionError } from '../errors/interactionError';

export const data = {
    name: 'reminders',
    client: false,
    slashCommand: new SlashCommandBuilder()
        .setName('reminders')
        .setDescription('Reminder related commands.')
        .addSubcommand(subcommand => subcommand.setName('create').setDescription('Creates a reminder.')
            .addIntegerOption(option => option.setName('time').setDescription('In how much time you want to be reminded of your message.').setRequired(true))
            .addStringOption(option => option.setName('unit').setDescription('Time unit.').setRequired(true)
                .addChoice('Seconds', 'seconds')
                .addChoice('Minutes', 'minutes')
                .addChoice('Hours', 'hours')
                .addChoice('Days', 'days')
                .addChoice('Weeks', 'weeks')
                .addChoice('Months', 'months')
                .addChoice('Years', 'years')
            )
            .addStringOption(option => option.setName('message').setDescription('Message you want to be reminded of.').setRequired(true))
        )
        .addSubcommand(subcommand => subcommand.setName('delete').setDescription('Delete a reminder.')
            .addStringOption(option => option.setName('id').setDescription('Id of the reminder to be deleted.').setRequired(true))
        )
}

export const execute = async (interaction: CommandInteraction) => {
    const subcommand = interaction.options.getSubcommand();

    const select: Record<string, Function> = {
        'create': createReminder,
        'delete': deleteReminder
    }

    await select[subcommand](interaction);
}

const createReminder = async (interaction: CommandInteraction) => {
    const time = interaction.options.getInteger('time')!;
    const unit = interaction.options.getString('unit')! as TimeUnits;
    const message = interaction.options.getString('message')!;

    const reminderId = await Reminders.create(interaction.user.id, time, unit, message).catch(error => {
        throw new InteractionError(error.message);
    });

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`**Reminder ID:** ${reminderId}`)
            .setDescription(`<@${interaction.user.id}>, I'll remind you about **${message}** in *${time} ${unit}*!`)
            .setColor('RANDOM')
    ], ephemeral: true });
}

const deleteReminder = async (interaction: CommandInteraction) => {
    const reminderId = interaction.options.getString('reminder')!;

    await Reminders.remove(reminderId);

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Deleted 1 reminder!')
            .setColor('RANDOM')
    ], ephemeral: true });
}