import { logger } from '@luferro/shared-utils';
import { Client, VoiceChannel } from 'discord.js';
import { GuildNodeCreateOptions, Player as DiscordPlayer } from 'discord-player';

export class Player extends DiscordPlayer {
	defaultNodeOptions: GuildNodeCreateOptions<VoiceChannel> = {
		leaveOnEmpty: true,
		leaveOnEmptyCooldown: 1000 * 60 * 5,
		leaveOnEnd: true,
		leaveOnEndCooldown: 1000 * 60 * 5,
		selfDeaf: false,
		bufferingTimeout: 0,
	};

	constructor(client: Client) {
		super(client);
		this.extractors.loadDefault();
		logger.debug(this.scanDeps());
	}
}
