import 'dotenv/config';

import { GatewayIntentBits } from 'discord.js';

import { Bot } from './Bot';

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

	process.on('uncaughtException', (error) => client.handleError(error, client));
	process.on('SIGINT', client.stop);
	process.on('SIGTERM', client.stop);
})();
