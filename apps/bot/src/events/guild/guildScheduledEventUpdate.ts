import { formatDate } from "@luferro/helpers/datetime";
import { BaseGuildVoiceChannel, EmbedBuilder, type GuildScheduledEvent } from "discord.js";
import { t } from "i18next";
import { FeedType } from "~/structures/Database.js";
import type { EventData, EventExecute } from "~/types/bot.js";

type Args = [oldGuildScheduledEvent: GuildScheduledEvent, newGuildScheduledEvent: GuildScheduledEvent];

export const data: EventData = { type: "on" };

export const execute: EventExecute<Args> = async ({ client, rest: [oldState, newState] }) => {
	if (oldState.isScheduled() && newState.isActive()) await handleEventStart(client, newState);
	if (oldState.isActive() && newState.isCompleted()) await handleEventEnd(newState);
};

const handleEventStart = async (client: Parameters<EventExecute>[0]["client"], event: Args[0]) => {
	const { guild, name, url, description, channel, entityMetadata, creator, scheduledStartAt, scheduledEndAt } = event;
	const location = entityMetadata?.location ?? channel;
	if (!guild || !location) return;

	const subscribers = await event.fetchSubscribers({ withMember: true });
	if (subscribers.size === 0) return;

	const role = await guild.roles.create({
		name,
		color: "Default",
		hoist: false,
		mentionable: false,
		position: guild.roles.cache.size + 1,
	});

	for (const { 1: subscriber } of subscribers) {
		subscriber.member.roles.add(role);
	}

	const localization = client.getLocalization();

	const embed = new EmbedBuilder()
		.setTitle(t("events.guild.guildScheduledEventUpdate.embed.title", { name }))
		.setURL(url)
		.setDescription(description || null)
		.addFields([
			{
				name: t("events.guild.guildScheduledEventUpdate.embed.fields.0.name"),
				value: location instanceof BaseGuildVoiceChannel ? `**<#${location.id}>**` : `**${location}**`,
			},
			{
				name: t("events.guild.guildScheduledEventUpdate.embed.fields.1.name"),
				value: scheduledStartAt ? formatDate(scheduledStartAt, localization) : t("common.unavailable"),
				inline: true,
			},
			{
				name: t("events.guild.guildScheduledEventUpdate.embed.fields.2.name"),
				value: scheduledEndAt ? formatDate(scheduledEndAt, localization) : t("common.unavailable"),
				inline: true,
			},
			{
				name: t("events.guild.guildScheduledEventUpdate.embed.fields.3.name"),
				value: creator?.username ?? t("common.unavailable"),
			},
		])
		.setImage(event.coverImageURL({ size: 4096 }))
		.setColor("Random");

	const feeds = await client.db.feeds.getFeedsByGuildId({ type: FeedType.EVENTS, guildId: guild.id });
	for (const { webhook } of feeds) {
		const guildWebhook = await client.fetchWebhook(webhook.id, webhook.token);
		guildWebhook?.send({ content: `${role}`, embeds: [embed] });
	}
};

const handleEventEnd = async (event: Args[0]) => {
	const { guild, name } = event;
	if (!guild) return;

	const role = guild.roles.cache.find((role) => role.name === name);
	if (!role) return;

	const subscribers = await event.fetchSubscribers({ withMember: true });
	for (const { 1: subscriber } of subscribers) {
		await subscriber.member.roles.remove(role);
	}

	await guild.roles.delete(role);
};
