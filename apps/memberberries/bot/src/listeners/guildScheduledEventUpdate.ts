import { type Events, Listener } from "@sapphire/framework";
import { ChannelType, type GuildScheduledEvent } from "discord.js";
import { and, eq } from "drizzle-orm";
import { events } from "~/db/schema.js";

export class GuildScheduledEventUpdateListener extends Listener<typeof Events.GuildScheduledEventUpdate> {
	public async run(oldEvent: GuildScheduledEvent, newEvent: GuildScheduledEvent) {
		if (oldEvent.isScheduled() && newEvent.isActive()) await this.onStart(newEvent);
		if (oldEvent.isActive() && newEvent.isCompleted()) await this.onEnd(newEvent);
		if (newEvent.isCanceled()) await this.onCancel(newEvent);
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

		await webhook.send(`${role} **\`${name}\`** has started!\n${url}`);
		await this.container.db
			.update(events)
			.set({ status: "active" })
			.where(and(eq(events.guildId, guild.id), eq(events.name, name)));
	}

	private async onEnd({ guild, name, url }: GuildScheduledEvent) {
		if (!guild) return;

		const role = guild.roles.cache.find((role) => role.name === name);
		if (!role) return;

		await guild.roles.delete(role);

		const storedWebhook = await this.container.db.query.webhooks.findFirst({
			where: (webhooks, { and, eq }) => and(eq(webhooks.guildId, guild.id), eq(webhooks.type, "events")),
		});
		if (!storedWebhook) return;

		const webhook = await this.container.client.fetchWebhook(storedWebhook.id, storedWebhook.token);
		const channel = webhook?.channel;
		if (!channel || channel.type !== ChannelType.GuildText) return;

		const messages = await channel.messages.fetch();
		const eventMessage = messages.find((message) => message.content.includes(role.id));
		if (!eventMessage) return;

		await webhook.editMessage(eventMessage.id, { content: `**\`${name}\`** is over!\n${url}` });

		await this.container.db
			.update(events)
			.set({ status: "expired" })
			.where(and(eq(events.guildId, guild.id), eq(events.name, name)));
	}

	private async onCancel({ guild, name }: GuildScheduledEvent) {
		if (!guild) return;

		await this.container.db
			.update(events)
			.set({ status: "cancelled" })
			.where(and(eq(events.guildId, guild.id), eq(events.name, name)));
	}
}
