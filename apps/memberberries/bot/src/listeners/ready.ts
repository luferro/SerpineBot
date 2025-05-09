import { Events, Listener } from "@sapphire/framework";

export class ReadyListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			once: true,
			event: Events.ClientReady,
		});
	}

	public async run() {
		for (const [guildId, guild] of this.container.client.guilds.cache) {
			const guildRegistration = await this.container.db.query.guilds.findFirst({
				where: (guilds, { eq }) => eq(guilds.id, guildId),
			});
			if (!guildRegistration) this.container.client.emit("guildCreate", guild);
		}

		this.container.logger.info("Bot | Ready to process interactions");
	}
}
