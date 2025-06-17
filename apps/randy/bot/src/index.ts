import { SoundCloudExtractor } from "@discord-player/extractor";
import { type Config, loadConfig } from "@luferro/config";
import { shuffle } from "@luferro/utils/data";
import {
	ApplicationCommandRegistries,
	LogLevel,
	RegisterBehavior,
	SapphireClient,
	container,
} from "@sapphire/framework";
import { type GuildQueue, type NodeResolvable, Player, useQueue } from "discord-player";
import { SpotifyExtractor } from "discord-player-spotify";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { type ApplicationEmoji, GatewayIntentBits } from "discord.js";

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

declare module "@sapphire/framework" {
	interface Preconditions {
		SelfAndUserInSameVoiceChannel: never;
		SelfNotInVoiceChannel: never;
		UserInVoiceChannel: never;
		QueueInitialized: never;
		QueueNotEmpty: never;
	}
}

declare module "@sapphire/pieces" {
	interface Container {
		config: Config;
		player: Player;
		guildIds: string[] | undefined;

		getEmoji(action: "play" | "skip" | "resume" | "pause"): Promise<ApplicationEmoji | null>;
	}
}

declare module "discord-player" {
	interface Player {
		getQueue<T = unknown>(node: NodeResolvable, required: true): GuildQueue<T>;
		getQueue<T = unknown>(node: NodeResolvable, required?: false): GuildQueue<T> | null;
		getQueue<T = unknown>(node: NodeResolvable, required?: boolean): GuildQueue<T> | null;
	}
}

container.config = loadConfig();
container.guildIds = container.config.get<string | undefined>("client.guilds")?.split(",");

container.getEmoji = async (action) => {
	const application = container.client.application;
	if (!application) return null;

	let emojis = application.emojis.cache;
	if (emojis.size === 0) emojis = await application.emojis.fetch();

	const categoryEmojis = emojis?.filter((emoji) => emoji.name?.includes(`${action}__`)).values();
	const shuffledEmojis = categoryEmojis ? shuffle([...categoryEmojis]) : [];
	return shuffledEmojis.pop() ?? null;
};

const client = new SapphireClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
	],
	logger: { level: LogLevel.Debug },
});

container.player = new Player(client);
await container.player.extractors.register(YoutubeiExtractor, {});
await container.player.extractors.register(SpotifyExtractor, {});
await container.player.extractors.register(SoundCloudExtractor, {});

container.player.getQueue = ((node: NodeResolvable, required: boolean) => {
	const queue = useQueue(node);
	if (!queue && required) throw new Error("Queue is required but not found.");
	return queue;
}) as typeof container.player.getQueue;

await client.login(container.config.get("client.randy.token"));
