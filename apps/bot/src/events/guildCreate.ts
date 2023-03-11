import { SettingsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import type { Guild } from 'discord.js';

import * as CommandsHandler from '../handlers/commands';
import type { Bot } from '../structures/bot';
import type { EventData } from '../types/bot';
import { EventName } from '../types/enums';

export const data: EventData = {
	name: EventName.GuildCreate,
	type: 'on',
};

export const execute = async (client: Bot, guild: Guild) => {
	await CommandsHandler.deployCommands(client);
	await SettingsModel.createGuildSettings(guild.id, { messages: [], webhooks: [] });
	logger.info(`Settings for **${guild.name}** have been created.`);
};
