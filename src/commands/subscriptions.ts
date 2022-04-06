import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as Subscriptions from '../services/subscriptions';
import * as StringUtil from '../utils/string';
import { TheMovieDBCategories } from '../types/categories';


export const data = {
    name: 'subscriptions',
    client: false,
    slashCommand: new SlashCommandBuilder()
        .setName('subscriptions')
        .setDescription('Subscription services related commands.')
        .addStringOption(option => option.setName('category').setDescription('Media category.').setRequired(true)
            .addChoice('Games', 'gaming')
            .addChoice('TV', 'tv')
            .addChoice('Movies', 'movie')
        )
        .addStringOption(option => option.setName('media').setDescription('Media title').setRequired(true))
}

export const execute = async (interaction: CommandInteraction) => {
    const choice = interaction.options.getString('category')! as (TheMovieDBCategories | 'gaming') ;
    const media = interaction.options.getString('media')!;

    const subscriptions = choice === 'gaming' ? await Subscriptions.getGamingSubscriptions(media) : await Subscriptions.getStreamingSubscriptions(media, choice);
    if(!subscriptions || subscriptions.length === 0) return await interaction.reply({ content: `No subscription services include ${media}.`, ephemeral: true });
    
    const { 0: { entry: { name } } } = subscriptions;
    const formattedSubscriptions = subscriptions.map(item => item.entry.url ? `**[${item.name}](${item.entry.url})**` : `**${item.name}**`);

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(StringUtil.truncate(name))
            .addField(`Available in **${subscriptions.length}** ${subscriptions.length > 1 ? 'subscriptions' : 'subscription'}`, formattedSubscriptions.join('\n'))
            .setColor('RANDOM')
    ]});
}