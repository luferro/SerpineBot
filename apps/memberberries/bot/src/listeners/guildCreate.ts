import { type Events, Listener } from "@sapphire/framework";
import type { Guild } from "discord.js";
import { guilds } from "~/db/schema.js";

export class GuildCreateListener extends Listener<typeof Events.GuildCreate> {
	public async run(guild: Guild) {
		await this.container.db.insert(guilds).values({ id: guild.id });
	}
}
