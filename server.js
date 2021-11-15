import 'dotenv/config';
import { Client, Intents } from 'discord.js';
import { connect, disconnect } from './utils/mongoose.js';
import { schedule } from './utils/schedule.js';
import { commands, worker } from './utils/imports.js';

const prefixes = ['./', '.', '/', '$', '!', '??'];
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

client.once('ready', async () => {
	try {
		await connect();
		worker.roles.setup(client);
		
		schedule('*/10 * * * * *', () => worker.reminders.checkReminder(client));
		schedule('*/15 7-23 * * *', () => worker.wishlists.checkWishlist(client));
		schedule('0 */6 * * *', () => worker.subscriptions.getSubscriptions());
		schedule('0 14 * * 0', () => worker.leaderboards.getSteamLeaderboard(client));
	} catch (error) {
		console.log(error);
	}
});

client.on('guildMemberAdd', (member) => {
	const role = member.guild.roles.cache.find(role => role.name === 'Restrictions');
	member.roles.add(role);
});

client.on('messageCreate', async(message) => {
	try {
		await commands.music.selectSearchOption(message);

		const filteredPrefixes = prefixes.filter(item => message.content.startsWith(item));
		if(filteredPrefixes.length === 0 || (message.author.bot && !message.content.startsWith('./cmd'))) return;

		const args = message.content.substring(filteredPrefixes[0].length).split(' ');
		switch(args[0].toLowerCase()) {
			//Useful tools commands
			case 'del': return await commands.del.deleteMessages(message, args);
			case 'poll': return commands.poll.createPoll(message, args);
			case 'youtube': return await commands.youtube.getYoutubeURL(message, args);
			case 'reminder': return await commands.reminder.setup(message, args);
			case 'secretsanta': return await commands.secretsanta.setup(client, message, args);
			//Games commands
			case 'steam': return await commands.steam.getSteam(client, message, args);
			case 'games': return await commands.games.getGames(message, args);
			case 'deals': return await commands.deals.getDeals(message, args);
			case 'specs': return await commands.specs.getGameSpecs(message, args);
			case 'reviews': return await commands.reviews.getReviews(message, args);
			case 'hltb': return await commands.howlongtobeat.getHowLongToBeat(message, args);
			//TV commands
			case 'tv': return await commands.tv.getTVShows(message, args);
			case 'movies': return await commands.movies.getMovies(message, args);
			//Entertainment commands
			case 'jokes': return await commands.jokes.getJokes(message, args);
			case 'aww': return await commands.reddit.getReddit(message, args);
			case 'memes': return await commands.reddit.getReddit(message, args);
			case 'comics': return await commands.comics.getComics(message, args);
			//Music commands
			case 'join': return await commands.music.join(message);
			case 'leave': return await commands.music.leave(message);
			case 'loop': return commands.music.loop(message);
			case 'queue': return commands.music.queue(message);
			case 'pause': return commands.music.pause(message);
			case 'resume': return commands.music.resume(message);
			case 'skip': return await commands.music.skip(message);
			case 'remove': return commands.music.remove(message, args);
			case 'clear': return commands.music.clear(message);
			case 'volume': return await commands.music.volume(message, args);
			case 'search': return await commands.music.search(message, args);
			case 'play': return await commands.music.setup(message, args);
			//Help command
			case 'cmd': return commands.cmd.getHelp(message, args);
			default: return;
		}
	} catch (error) {
		console.log(`Command that triggered the error: ${message.content}`);
		console.log(error);	
	}
});

['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => {
    disconnect();
    process.exit(1);
}));

client.login(process.env.BOT_TOKEN);