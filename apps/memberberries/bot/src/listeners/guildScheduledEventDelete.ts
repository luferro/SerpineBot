import { type Events, Listener } from "@sapphire/framework";
import type { GuildScheduledEvent } from "discord.js";
import { and, eq } from "drizzle-orm";
import { events } from "~/db/schema.js";

export class GuildScheduledEventDeleteListener extends Listener<typeof Events.GuildScheduledEventDelete> {
	public async run(event: GuildScheduledEvent) {
		await this.container.db
			.update(events)
			.set({ status: "cancelled" })
			.where(and(eq(events.guildId, event.guildId), eq(events.name, event.name)));
	}
}
