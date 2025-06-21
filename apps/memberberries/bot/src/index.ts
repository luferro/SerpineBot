import "@sapphire/plugin-scheduled-tasks/register";
import "~/container.js";

import {
	ApplicationCommandRegistries,
	LogLevel,
	RegisterBehavior,
	SapphireClient,
	container,
} from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";

export const timezone = container.config.get("tz");

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

const client = new SapphireClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildScheduledEvents,
	],
	tasks: {
		bull: {
			connection: {
				url: container.config.get("services.redis.uri"),
			},
		},
	},
	logger: {
		level: container.config.runtimeEnvironment === "production" ? LogLevel.Info : LogLevel.Debug,
	},
});

client.login(container.config.get("client.memberberries.token"));
