import type { Bot } from '../structures/bot';
import type { EventData } from '../types/bot';
import type { Guild } from 'discord.js';
import { logger } from '@luferro/shared-utils';
import * as CommandsHandler from '../handlers/commands';
import { settingsModel } from '../database/models/settings';
import { EventName } from '../types/enums';

export const data: EventData = {
	name: EventName.GuildCreate,
	type: 'on',
};

export const execute = async (client: Bot, guild: Guild) => {
	await CommandsHandler.deploy(client);
	const settings = await settingsModel.findOne({ guildId: guild.id });

	const guildInfo = {
		roles: { channelId: settings?.roles.channelId ?? null, options: settings?.roles.options ?? [] },
		birthdays: { channelId: settings?.birthdays.channelId ?? null },
		leaderboards: {
			steam: { channelId: settings?.leaderboards.steam.channelId ?? null },
			xbox: { channelId: settings?.leaderboards.xbox.channelId ?? null },
		},
		webhooks: settings?.webhooks ?? [],
	};

	await settingsModel.updateOne({ guildId: guild.id }, { $set: guildInfo }, { upsert: true });

	logger.info(`SerpineBot has joined guild **${guild.name}**.`);
};
