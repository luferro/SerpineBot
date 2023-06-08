import { BaseGuildVoiceChannel, EmbedBuilder, GuildScheduledEvent } from 'discord.js';

import type { Bot } from '../structures/Bot';
import type { EventData } from '../types/bot';

export const data: EventData = { type: 'on' };

export const execute = async (
	client: Bot,
	oldGuildScheduledEvent: GuildScheduledEvent,
	newGuildScheduledEvent: GuildScheduledEvent,
) => {
	const isStarting = oldGuildScheduledEvent.isScheduled() && newGuildScheduledEvent.isActive();
	if (!isStarting) return;

	const { guild, name, url, description, channel, entityMetadata, creator, scheduledStartAt, scheduledEndAt } =
		newGuildScheduledEvent;

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
				value: scheduledStartAt?.toLocaleString('pt-PT') ?? 'N/A',
				inline: true,
			},
			{
				name: '**End**',
				value: scheduledEndAt?.toLocaleString('pt-PT') ?? 'N/A',
				inline: true,
			},
			{
				name: '**Created by**',
				value: creator?.tag ?? 'N/A',
			},
		])
		.setThumbnail(guild.iconURL())
		.setImage(newGuildScheduledEvent.coverImageURL({ size: 4096 }))
		.setColor('Random');

	const webhook = await client.webhook({ guild, category: 'Events' });
	webhook?.send({ embeds: [embed] });
};
