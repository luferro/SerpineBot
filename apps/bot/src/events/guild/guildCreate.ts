import { SettingsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import type { Guild } from 'discord.js';

import type { EventData, EventExecute } from '../../types/bot';

type Args = [guild: Guild];

export const data: EventData = { type: 'on' };

export const execute: EventExecute<Args> = async ({ rest: [guild] }) => {
	await SettingsModel.createSettings({
		guildId: guild.id,
		roles: { channelId: null, options: [] },
		webhooks: new Map(),
	});
	logger.info(`Settings for **${guild.name}** have been created.`);
};
