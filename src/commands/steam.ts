import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import * as Steam from '../apis/steam';
import * as Leaderboards from '../services/leaderboards';
import { steamModel } from '../database/models/steam';
import { InteractionError } from '../errors/interactionError';

export const data = {
    name: 'steam',
    client: false,
    slashCommand: new SlashCommandBuilder()
        .setName('steam')
        .setDescription('Steam related commands.')
        .addSubcommand(subcommand => subcommand.setName('sale').setDescription('Returns the next steam sale.'))
        .addSubcommand(subcommand => subcommand.setName('top').setDescription('Returns Steam\'s top played games.'))
        .addSubcommand(subcommand => subcommand.setName('hot').setDescription('Returns Steam\'s top sellers.'))
        .addSubcommand(subcommand => subcommand.setName('new').setDescription('Returns Steam\'s upcoming games.'))
        .addSubcommand(subcommand => subcommand.setName('leaderboard').setDescription('Returns the Steam leaderboard for the week.'))
        .addSubcommand(subcommand => subcommand.setName('profile').setDescription('Returns the Steam profile for your account/mentioned user.')
            .addMentionableOption(option => option.setName('mention').setDescription('User mention.'))
        )
        .addSubcommand(subcommand => subcommand.setName('wishlist').setDescription('Returns the Steam wishlist for your account/mentioned user.')
            .addMentionableOption(option => option.setName('mention').setDescription('User mention.'))
        )
}

export const execute = async (interaction: CommandInteraction) => {
    const subcommand = interaction.options.getSubcommand();

    const select: Record<string, Function> = {
        'new': getUpcoming,
        'top': getTopPlayed,
        'hot': getTopSellers,
        'sale': getNextSale,
        'profile': getProfile,
        'wishlist': getWishlist,
        'leaderboard': getLeaderboard
    }

    await select[subcommand](interaction);
}

const getNextSale = async (interaction: CommandInteraction) => {
    const { sale, status, upcoming } = await Steam.getNextSale();

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('When is the next Steam sale?')
            .setDescription(`*${status || ''}*\n**${sale || 'Couldn\'t find the next steam sale.'}**`)
            .addField('Upcoming Games', upcoming.length > 0 ? upcoming.join('\n') : 'N/A')
            .setColor('RANDOM')
    ]});
}

const getTopPlayed = async (interaction: CommandInteraction) => {
    const { topPlayed } = await Steam.getTopPlayed();

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam Top Played')
            .setDescription(topPlayed.length > 0 ? topPlayed.join('\n') : 'N/A')
            .setColor('RANDOM')
    ]});
}

const getTopSellers = async (interaction: CommandInteraction) => {
    const { topSellers } = await Steam.getTopSellers();

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam Top Sellers')
            .setDescription(topSellers.length > 0 ? topSellers.join('\n') : 'N/A')
            .setColor('RANDOM')
    ]});
}

const getUpcoming = async (interaction: CommandInteraction) => {
    const { upcoming } = await Steam.getUpcoming();

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam Upcoming')
            .setDescription(upcoming.length > 0 ? upcoming.join('\n') : 'N/A')
            .setColor('RANDOM')
    ]});
}

const getLeaderboard = async (interaction: CommandInteraction) => {
    const leaderboard = await Leaderboards.getSteamLeaderboard(interaction.client);
    if(!leaderboard) throw new InteractionError('No Steam leaderboard is available.');

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Weekly Steam Leaderboard')
            .setDescription(leaderboard.join('\n'))
            .setFooter({ text: 'Leaderboard resets every sunday.' })
            .setColor('RANDOM')
    ]});
}

const getProfile = async (interaction: CommandInteraction) => {
    const mention = interaction.options.getMentionable('mention') as GuildMember | null;
    const userId = mention?.user.id ?? interaction.user.id;

    const integration = await steamModel.findOne({ userId });
    if(!integration) throw new InteractionError('No Steam integration is in place.');

    const { name, image, status, logoutAt, createdAt } = await Steam.getProfile(integration.profile.id);

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(name)
            .setURL(integration.profile.url)
            .setThumbnail(image ?? '')
            .addField('SteamId64', integration.profile.id)
            .addField('Status', status)
            .addField('Created at', createdAt, true)
            .addField('Last logout at', logoutAt, true)
            .setColor('RANDOM')
    ]});
}

const getWishlist = async (interaction: CommandInteraction) => {
    const mention = interaction.options.getMentionable('mention') as GuildMember | null;
    const user = mention?.user ?? interaction.user;

    const integration = await steamModel.findOne({ userId: user.id });
    if(!integration) throw new InteractionError('No Steam integration is in place.');

    const formattedWishlist = integration.wishlist.slice(0, 10).map((item, index) => `\`${index + 1}.\` **[${item.name}](${item.url})** | ${item.discounted || item.free && 'Free' || 'N/A'}`);
    integration.wishlist.length - formattedWishlist.length > 0 && formattedWishlist.push(`And ${integration.wishlist.length - formattedWishlist.length} more!`);

    await interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`\`${user.tag}\`'s wishlist`)
            .setURL(`https://store.steampowered.com/wishlist/profiles/${integration.profile.id}/#sort=order`)
            .setDescription(formattedWishlist.join('\n'))
            .setColor('RANDOM')
    ]});
}