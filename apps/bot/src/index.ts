import 'dotenv/config';

import { GatewayIntentBits } from 'discord.js';

import { Bot } from './structures/Bot';

(async () => {
	const client = new Bot({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildScheduledEvents,
		],
	});
	await client.start();

	['SIGINT', 'SIGTERM'].forEach((event) => process.on(event, client.stop));
})();
