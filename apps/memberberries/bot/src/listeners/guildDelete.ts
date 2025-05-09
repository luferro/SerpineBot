import { type Events, Listener } from "@sapphire/framework";
import type { Guild } from "discord.js";
import { eq } from "drizzle-orm";
import { guilds } from "~/db/schema.js";

export class GuildDeleteListener extends Listener<typeof Events.GuildDelete> {
	public async run(guild: Guild) {
		await this.container.db.delete(guilds).where(eq(guilds.id, guild.id));
	}
}
