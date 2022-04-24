import { Intents } from 'discord.js';
import { Bot } from './bot';

(() => {
	const client = new Bot({
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MEMBERS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.DIRECT_MESSAGES,
			Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
			Intents.FLAGS.GUILD_VOICE_STATES,
		],
	});
	client.start();

	['SIGINT', 'SIGTERM'].forEach((event) => process.on(event, client.stop));
})();
