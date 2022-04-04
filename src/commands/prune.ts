import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, Permissions, TextChannel } from 'discord.js';
import { InteractionError } from '../errors/interactionError';

export const data = {
    name: 'prune',
    client: false,
    slashCommand: new SlashCommandBuilder()
        .setName('prune')
        .setDescription('Delete messages from any user. Maximum of 100 messages and can\'t be older than 2 weeks.')
        .addIntegerOption(option => option.setName('quantity').setDescription('Quantity of messages to delete.').setRequired(true))
}

export const execute = async (interaction: CommandInteraction) => {
    const member = interaction.member as GuildMember;
    if(!member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) throw new InteractionError('You don\'t have permissions to execute this command.');

    const quantity = interaction.options.getInteger('quantity')!;
    if(quantity < 2 || quantity > 100) throw new InteractionError('Invalid quantity. Choose between 2 and 100 messages.');

    const channel = interaction.channel as TextChannel;
    const messages = await channel.bulkDelete(quantity, true);
    await interaction.reply({ content: `${messages.size} messages have been deleted.`, ephemeral: true });
}