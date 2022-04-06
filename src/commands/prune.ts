import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, Permissions, TextChannel } from 'discord.js';

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
    if(!member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return await interaction.reply({ content: 'You don\'t have permissions to execute this command.', ephemeral: true });

    const quantity = interaction.options.getInteger('quantity')!;
    if(quantity < 2 || quantity > 100) return await interaction.reply({ content: 'Invalid quantity. Choose between 2 and 100 messages.', ephemeral: true });

    const channel = interaction.channel as TextChannel;
    const messages = await channel.bulkDelete(quantity, true);
    await interaction.reply({ content: `${messages.size} messages have been deleted.`, ephemeral: true });
}