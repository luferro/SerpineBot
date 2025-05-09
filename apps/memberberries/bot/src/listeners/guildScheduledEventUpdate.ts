import { type Events, Listener } from "@sapphire/framework";
import { ChannelType, type GuildScheduledEvent } from "discord.js";
import { and, eq } from "drizzle-orm";
import { events } from "~/db/schema.js";

export class GuildScheduledEventUpdateListener extends Listener<typeof Events.GuildScheduledEventUpdate> {
	public async run(oldEvent: GuildScheduledEvent, newEvent: GuildScheduledEvent) {
		if (oldEvent.isScheduled() && newEvent.isActive()) await this.onStart(newEvent);
		if (oldEvent.isActive() && newEvent.isCompleted()) await this.onEnd(newEvent);
	}

	private async onStart(event: GuildScheduledEvent) {
		const { guild, name, url } = event;
		if (!guild) return;

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

		const storedWebhook = await this.container.db.query.webhooks.findFirst({
			where: (webhooks, { and, eq }) => and(eq(webhooks.guildId, guild.id), eq(webhooks.type, "events")),
		});
		if (!storedWebhook) return;

		const webhook = await this.container.client.fetchWebhook(storedWebhook.id, storedWebhook.token);
		if (!webhook) return;

		await webhook.send(`${role} **\`${name}\`** is starting!\n${url}`);
		await this.container.db
			.update(events)
			.set({ status: "active" })
			.where(and(eq(events.guildId, guild.id), eq(events.name, name)));
	}

	private async onEnd(event: GuildScheduledEvent) {
		const { guild, name, url } = event;
		if (!guild) return;

		const role = guild.roles.cache.find((role) => role.name === name);
		if (!role) return;

		const storedWebhook = await this.container.db.query.webhooks.findFirst({
			where: (webhooks, { and, eq }) => and(eq(webhooks.guildId, guild.id), eq(webhooks.type, "events")),
		});
		if (!storedWebhook) return;

		const webhook = await this.container.client.fetchWebhook(storedWebhook.id, storedWebhook.token);
		const channel = webhook?.channel;
		if (!channel || channel.type !== ChannelType.GuildText) return;

		const messages = await channel.messages.fetch();
		const lastMessage = messages.filter((message) => message.mentions.roles.has(role.id)).at(-1);
		if (!lastMessage) return;

		await guild.roles.delete(role);

		await lastMessage.edit(`**\`${name}\`** is over!\n${url}`);
		await this.container.db
			.update(events)
			.set({ status: "expired" })
			.where(and(eq(events.guildId, guild.id), eq(events.name, name)));
	}
}
