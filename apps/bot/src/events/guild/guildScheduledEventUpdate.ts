import { BaseGuildVoiceChannel, EmbedBuilder, GuildScheduledEvent } from 'discord.js';

import type { EventData, EventExecute } from '../../types/bot';

type Args = [oldGuildScheduledEvent: GuildScheduledEvent, newGuildScheduledEvent: GuildScheduledEvent];

export const data: EventData = { type: 'on' };

export const execute: EventExecute<Args> = async ({ client, rest: [oldState, newState] }) => {
	const isStarting = oldState.isScheduled() && newState.isActive();
	if (!isStarting) return;

	const { guild, name, url, description, channel, entityMetadata, creator, scheduledStartAt, scheduledEndAt } =
		newState;

	const location = entityMetadata?.location ?? channel;
	if (!guild || !location) return;

	const embed = new EmbedBuilder()
		.setTitle(`\`${name}\` is starting!`)
		.setURL(url)
		.setDescription(description || null)
		.addFields([
			{
				name: '**Event location**',
				value: location instanceof BaseGuildVoiceChannel ? `**<#${location.id}>**` : `**${location}**`,
			},
			{
				name: '**Start**',
				value: scheduledStartAt?.toLocaleString(client.config.LOCALE, { timeZone: client.config.TZ }) ?? 'N/A',
				inline: true,
			},
			{
				name: '**End**',
				value: scheduledEndAt?.toLocaleString(client.config.LOCALE, { timeZone: client.config.TZ }) ?? 'N/A',
				inline: true,
			},
			{
				name: '**Created by**',
				value: creator?.tag ?? 'N/A',
			},
		])
		.setThumbnail(guild.iconURL())
		.setImage(newState.coverImageURL({ size: 4096 }))
		.setColor('Random');

	const webhook = await client.webhook({ guild, category: 'Events' });
	webhook?.send({ embeds: [embed] });
};
