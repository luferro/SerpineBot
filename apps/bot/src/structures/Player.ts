import type { Logger } from "@luferro/helpers/logger";
import { Player as DiscordPlayer, type GuildNodeCreateOptions } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";
import type { VoiceChannel } from "discord.js";
import type { Bot } from "~/structures/Bot.js";

export class Player extends DiscordPlayer {
	private logger: Logger;

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
		this.logger = client.logger;
	}

	async loadDependencies() {
		await this.extractors.loadDefault((ext) => ext !== "YouTubeExtractor");
		await this.extractors.register(YoutubeiExtractor, {});
		this.logger.debug(this.scanDeps());
	}
}
