import { Guild } from 'discord.js';
import { Bot } from '../bot';
import * as CommandsHandler from '../handlers/commands';
import { settingsModel } from '../database/models/settings';

export const data = {
    name: 'guildCreate',
    once: false
}

export const execute = async (client: Bot, guild: Guild) => {
    await CommandsHandler.deploy(client);
    const settings = await settingsModel.findOne({ guildId: guild.id });
    
    const guildInfo = {
        roles: {
            channelId: settings?.roles.channelId ?? null,
            options: settings?.roles.options ?? []
        },
        birthdays: {
            channelId: settings?.birthdays.channelId ?? null
        },
        leaderboards: {
            steam: {
                channelId: settings?.leaderboards.steam.channelId ?? null
            }
        },
        webhooks: settings?.webhooks ?? []
    }

    await settingsModel.updateOne({ guildId: guild.id }, { $set: guildInfo }, { upsert: true });
}