import { type Events, Listener } from "@sapphire/framework";
import type { GuildScheduledEvent } from "discord.js";
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

		await this.container.db
			.update(events)
			.set({ status: "active" })
			.where(and(eq(events.guildId, guild.id), eq(events.name, name)));

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

		const registeredWebhooks = await this.container.getWebhooks(guild.id, "events");
		for (const registeredWebhook of registeredWebhooks) {
			const webhook = await this.container.client.fetchWebhook(registeredWebhook.id, registeredWebhook.token);
			if (!webhook) continue;

			await webhook.send(`${role} **\`${name}\`** has started!\n${url}`);
		}
	}

	private async onEnd({ guild, name, url }: GuildScheduledEvent) {
		if (!guild) return;

		await this.container.db
			.update(events)
			.set({ status: "expired" })
			.where(and(eq(events.guildId, guild.id), eq(events.name, name)));

		const role = guild.roles.cache.find((role) => role.name === name);
		if (!role) return;

		await guild.roles.delete(role);

		const registeredWebhooks = await this.container.getWebhooks(guild.id, "events");
		for (const registeredWebhook of registeredWebhooks) {
			const webhook = await this.container.client.fetchWebhook(registeredWebhook.id, registeredWebhook.token);
			const channel = webhook?.channel;
			if (!channel || !channel.isTextBased()) continue;

			const messages = await channel.messages.fetch();
			const eventMessage = messages.find((message) => message.content.includes(url));
			if (!eventMessage) continue;

			await webhook.editMessage(eventMessage.id, { content: `**\`${name}\`** is over!\n${url}` });
		}
	}

	private async onCancel({ guild, name }: GuildScheduledEvent) {
		if (!guild) return;

		await this.container.db
			.update(events)
			.set({ status: "cancelled" })
			.where(and(eq(events.guildId, guild.id), eq(events.name, name)));
	}
}
