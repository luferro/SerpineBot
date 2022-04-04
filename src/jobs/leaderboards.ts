import { MessageEmbed, TextChannel } from 'discord.js';
import { Bot } from '../bot';
import * as Leaderboards from '../services/leaderboards';
import { settingsModel } from '../database/models/settings';
import { steamModel } from '../database/models/steam';

export const data = {
    name: 'leaderboards',
    schedule: '0 0 0 * * 0'
}

export const execute = async (client: Bot) => {
    const leaderboard = await Leaderboards.getSteamLeaderboard(client);
    if(leaderboard.length === 0) return;

    await steamModel.updateMany({}, { $set: { 'recentlyPlayed.$[].weeklyHours': 0 } });

    for(const [guildId, guild] of client.guilds.cache) {
        const settings = await settingsModel.findOne({ guildId });
        const channelId = settings?.leaderboards.steam.channelId;
        if(!channelId) continue;

        const channel = await client.channels.fetch(channelId) as TextChannel | null;
        if(!channel) continue;

        await channel.send({ embeds: [
            new MessageEmbed()
                .setTitle('Weekly Steam Leaderboard')
                .setDescription(leaderboard.join('\n'))
                .setFooter({ text: 'Leaderboard resets every sunday.' })
                .setColor('RANDOM')
        ]});
    }
}