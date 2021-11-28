import 'dotenv/config';
import { Client, Intents } from 'discord.js';
import { schedule } from './utils/schedule.js';
import { connect, disconnect } from './utils/mongoose.js';
import { webhooks } from './handlers/webhooks.js';
import { worker } from './handlers/worker.js';
import { commands } from './handlers/commands.js';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

client.once('ready', () => {
	connect();
	commands.createSlashCommands(client);
	worker.roles.createRolesMessage(client);

	schedule('*/3 * * * *', () => webhooks.execute());
	schedule('*/10 * * * * *', () => worker.reminders.checkReminder(client));
	schedule('*/15 7-23 * * *', () => worker.wishlists.checkWishlist(client));
	schedule('0 */6 * * *', () => worker.subscriptions.getSubscriptions());
	schedule('0 14 * * 0', () => worker.leaderboards.getSteamLeaderboard(client));
});

client.on('interactionCreate', async interaction => {
	try {
		if(interaction.isSelectMenu()) return await commands.music.selectOption(interaction);
		if(!interaction.isCommand()) return;

		switch(interaction.commandName) {
			//Useful tools commands
			case 'delete': return await commands.prune.bulkDelete(interaction);
			case 'poll': return await commands.poll.createPoll(interaction);
			case 'youtube': return await commands.youtube.getYoutubeURL(interaction);
			case 'reminder': return await commands.reminder.setup(interaction);
			case 'secretsanta': return await commands.secretsanta.setup(interaction);
			//Games commands
			case 'steam': return await commands.steam.getSteam(interaction);
			case 'games': return await commands.games.getGames(interaction);
			case 'deals': return await commands.deals.getDeals(interaction);
			case 'specs': return await commands.specs.getSpecs(interaction);
			case 'reviews': return await commands.reviews.getReviews(interaction);
			case 'hltb': return await commands.howlongtobeat.getHowLongToBeat(interaction);
			//Entertainment commands
			case 'jokes': return await commands.jokes.getJokes(interaction);
			case 'reddit': return await commands.reddit.getReddit(interaction);
			case 'comics': return await commands.comics.getComics(interaction);
			//TV commands
			case 'tv': return await commands.tv.getTVSeries(interaction);
			case 'movies': return await commands.movies.getMovies(interaction);
			//Music commands
			case 'join': return await commands.music.join(interaction);
			case 'leave': return await commands.music.leave(interaction);
			case 'play': return await commands.music.addToQueue(interaction);
			case 'remove': return commands.music.removeFromQueue(interaction);
			case 'clear': return commands.music.clearQueue(interaction);
			case 'queue': return commands.music.queue(interaction);
			case 'pause': return commands.music.pause(interaction);
			case 'resume': return commands.music.resume(interaction);
			case 'loop': return commands.music.loop(interaction);
			case 'skip': return await commands.music.skip(interaction);
			case 'volume': return await commands.music.volume(interaction);
			case 'search': return await commands.music.search(interaction);
			default: return;
		}
	} catch (error) {
		interaction.reply({ content: 'Something went wrong! Please try again later.', ephemeral: true });
		console.log(`Command that triggered the error: ${interaction.commandName || interaction.component.customId}`);
		console.log(error);	
	}
});

client.on('guildMemberAdd', member => {
	const role = member.guild.roles.cache.find(role => role.name === 'Restrictions');
	member.roles.add(role);
});

client.on('messageReactionAdd', (reaction, user) => {
	if(reaction.message.channel.id === process.env.ROLES_CHANNEL) return worker.roles.handleReaction(reaction, user, true);
});

client.on('messageReactionRemove', (reaction, user) => {
	if(reaction.message.channel.id === process.env.ROLES_CHANNEL) return worker.roles.handleReaction(reaction, user, false);
});

['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => {
    disconnect();
    process.exit(1);
}));

client.login(process.env.BOT_TOKEN);