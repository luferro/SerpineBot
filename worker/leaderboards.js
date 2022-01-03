import { MessageEmbed } from 'discord.js';
import { load } from 'cheerio';
import { fetchData } from '../utils/fetch.js';
import steamSchema from '../models/steamSchema.js';
import settingsSchema from '../models/settingsSchema.js';

const getMedal = type => {
    const options = {
        0: '🥇',
        1: '🥈',
        2: '🥉'
    };
    return options[type] || null;
}

const getSteamLeaderboard = async client => {
    for(const [guildID, guild] of client.guilds.cache) {
        const data = await getSteamRecentlyPlayed(guild);

        const stats = [];
        for(const [index, item] of data.entries()) {
            await steamSchema.updateOne({ user: item.user }, { $set: { recentlyPlayed: item.games } });

            const medal = getMedal(index);
            const position = medal || `\`${index + 1}.\``;
            const description = `**${item.tag}** with \`${item.weeklyHours}h\`\nTop played game was **[${item.topPlayed}](${item.topPlayedURL})**`;

            stats.push(`${position} ${description}`);
        }
        if(stats.length === 0) continue;

        const settings = await settingsSchema.find({ guild: guildID });
        const channelID = settings[0]?.leaderboards?.steam?.channel;
        if(!channelID) continue;

        const channel = await client.channels.fetch(channelID);
        channel.send({ embeds: [
            new MessageEmbed()
                .setTitle('Weekly Steam Leaderboard')
                .setDescription(stats.join('\n'))
                .setFooter('Leaderboard resets every sunday.')
                .setColor('RANDOM')
        ]});
    }
}

const getSteamRecentlyPlayed = async guild => {
    const array = [];

    const steamIntegrations = await steamSchema.find();
    for(const steamIntegration of steamIntegrations) {
        const guildHasUser = guild.members.cache.has(steamIntegration.user);
        if(!guildHasUser || steamIntegration.recentlyPlayed?.length === 0) continue;

        const member = await guild.members.fetch(steamIntegration.user);

        const data = await fetchData(`${steamIntegration.profile.url}/games/?tab=recent`);
        const $ = load(data);

        const script = $('.responsive_page_template_content > script').first().get(0).children[0].data.trim();
        const string = script.substring(script.indexOf('['), script.indexOf('];') + 1);
        const gamesPlayed = JSON.parse(string);

        const games = gamesPlayed.map(item => ({
            id: item.appid,
            name: item.name,
            twoWeeksHours: parseFloat(item.hours),
            totalHours: parseFloat((item.hours_forever || item.hours)?.replace(',', '') || 0)
        })).filter(item => item.twoWeeksHours);

        const recentlyPlayed = [];
        for(const game of games) {
            const storedItem = steamIntegration.recentlyPlayed.find(item => item.id === game.id);
            const weeklyHours = storedItem ? game.totalHours - storedItem.totalHours : game.twoWeeksHours;

            recentlyPlayed.push({ name: game.name, url: `https://store.steampowered.com/app/${game.id}`, weeklyHours });
        }
        const topPlayed = recentlyPlayed.reduce((acc, el) => el.weeklyHours > acc.weeklyHours ? el : acc);
        const weeklyHours = recentlyPlayed.reduce((acc, el) => acc + el.weeklyHours, 0);

        array.push({ user: steamIntegration.user, tag: member.user.tag, games, topPlayed: topPlayed.name, topPlayedURL: topPlayed.url, weeklyHours: parseFloat(weeklyHours.toFixed(1)) });
    }
    return array.sort((a, b) => b.weeklyHours - a.weeklyHours).slice(0, 10);
}

export default { getSteamLeaderboard, getSteamRecentlyPlayed, getMedal };