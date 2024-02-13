import { WebhookType } from "@luferro/database";
import { DateUtil } from "@luferro/shared-utils";
import { BaseGuildVoiceChannel, EmbedBuilder, GuildScheduledEvent } from "discord.js";
import { t } from "i18next";

import { Bot } from "../../structures/Bot";
import type { EventData, EventExecute } from "../../types/bot";

type Args = [oldGuildScheduledEvent: GuildScheduledEvent, newGuildScheduledEvent: GuildScheduledEvent];

export const data: EventData = { type: "on" };

export const execute: EventExecute<Args> = async ({ client, rest: [oldState, newState] }) => {
	if (oldState.isScheduled() && newState.isActive()) await handleEventStart({ client, event: newState });
	if (oldState.isActive() && newState.isCompleted()) await handleEventEnd({ event: newState });
};

const handleEventStart = async ({ client, event }: { client: Bot; event: GuildScheduledEvent }) => {
	const { guild, name, url, description, channel, entityMetadata, creator, scheduledStartAt, scheduledEndAt } = event;
	const location = entityMetadata?.location ?? channel;
	if (!guild || !location) return;

	const role = await guild.roles.create({
		name,
		color: "Default",
		hoist: false,
		mentionable: false,
		position: guild.roles.cache.size + 1,
	});

	const subscribers = await event.fetchSubscribers({ withMember: true });
	for (const { 1: subscriber } of subscribers) {
		subscriber.member.roles.add(role);
	}

	const embed = new EmbedBuilder()
		.setTitle(t("events.guild.guildScheduledEventUpdate.embed.title", { name: `\`${name}\`` }))
		.setURL(url)
		.setDescription(description || null)
		.addFields([
			{
				name: t("events.guild.guildScheduledEventUpdate.embed.fields.0.name"),
				value: location instanceof BaseGuildVoiceChannel ? `**<#${location.id}>**` : `**${location}**`,
			},
			{
				name: t("events.guild.guildScheduledEventUpdate.embed.fields.1.name"),
				value: scheduledStartAt
					? DateUtil.format({ date: scheduledStartAt, timezone: client.config.get("timezone") })
					: t("common.unavailable"),
				inline: true,
			},
			{
				name: t("events.guild.guildScheduledEventUpdate.embed.fields.2.name"),
				value: scheduledEndAt
					? DateUtil.format({ date: scheduledEndAt, timezone: client.config.get("timezone") })
					: t("common.unavailable"),
				inline: true,
			},
			{
				name: t("events.guild.guildScheduledEventUpdate.embed.fields.3.name"),
				value: creator?.username ?? t("common.unavailable"),
			},
		])
		.setThumbnail(guild.iconURL())
		.setImage(event.coverImageURL({ size: 4096 }))
		.setColor("Random");

	const { webhook } = await client.getWebhook({ guild, type: WebhookType.EVENTS });
	webhook?.send({ content: `${role}`, embeds: [embed] });
};

const handleEventEnd = async ({ event }: { event: GuildScheduledEvent }) => {
	const { guild, name } = event;
	if (!guild) return;

	const role = guild.roles.cache.find((role) => role.name === name);
	if (!role) return;

	const subscribers = await event.fetchSubscribers({ withMember: true });
	for (const { 1: subscriber } of subscribers) {
		subscriber.member.roles.remove(role);
	}

	await guild.roles.delete(role);
};
