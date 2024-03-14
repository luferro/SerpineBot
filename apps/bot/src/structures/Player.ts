import { Player as DiscordPlayer, type GuildNodeCreateOptions } from "discord-player";
import type { VoiceChannel } from "discord.js";
import type { Bot } from "./Bot";

export class Player extends DiscordPlayer {
	defaultNodeOptions: GuildNodeCreateOptions<VoiceChannel> = {
		leaveOnEmpty: true,
		leaveOnEmptyCooldown: 1000 * 60 * 5,
		leaveOnEnd: true,
		leaveOnEndCooldown: 1000 * 60 * 5,
		selfDeaf: false,
		bufferingTimeout: 0,
	};

	constructor(client: Bot) {
		super(client);
		this.extractors.loadDefault();
		client.logger.debug(this.scanDeps());
	}
}
