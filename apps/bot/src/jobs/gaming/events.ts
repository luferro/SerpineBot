import { GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel } from 'discord.js';
import { t } from 'i18next';

import type { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 0 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const events = await client.api.gaming.igdb.getUpcomingEvents();

	for (const { 1: guild } of client.guilds.cache) {
		const guildEvents = await guild.scheduledEvents.fetch();
		for (const { name, description, image, url, scheduledStartAt, scheduledStartEnd } of events) {
			const hasGuildEvent = guildEvents.some((guildEvent) => guildEvent.name === name);
			if (hasGuildEvent) continue;

			await guild.scheduledEvents.create({
				name,
				image,
				description: t('jobs.gaming.events.scheduled.description', {
					text: description,
					url: url.youtube ?? url.twitch ?? '',
				}),
				scheduledStartTime: scheduledStartAt,
				scheduledEndTime: scheduledStartEnd,
				entityType: GuildScheduledEventEntityType.External,
				privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
				entityMetadata: { location: url.twitch ?? url.youtube ?? t('common.tbd') },
			});
		}
	}
};
