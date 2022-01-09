import 'dotenv/config';
import { Client, Intents } from 'discord.js';
import { schedule } from './utils/schedule.js';
import { connect, disconnect } from './utils/mongoose.js';
import { webhooks } from './handlers/webhooks.js';
import { worker } from './handlers/worker.js';
import { commands } from './handlers/commands.js';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
client.login(process.env.BOT_TOKEN);

client.once('ready', async () => {
	try {
		await connect();
		await commands.createSlashCommands(client);
		await worker.roles.createRolesMessage(client);

		schedule('*/3 * * * *', () => webhooks.execute(client));
		schedule('0 15 * * *', () => worker.subscriptions.getSubscriptions());
		schedule('*/10 * * * * *', () => worker.reminders.checkReminder(client));
		schedule('*/15 7-23 * * *', () => worker.wishlists.checkWishlist(client));
		schedule('0 0 * * 0', () => worker.leaderboards.getSteamLeaderboard(client));	
	} catch (error) {
		console.log(error);
	}
});

client.on('interactionCreate', async interaction => {
	try {
		if(!interaction.isCommand()) return;

		const executeCommand = command => {
			const options = {
				//Tools commands
				'poll': () => commands.poll.createPoll(interaction),
				'delete': () => commands.prune.bulkDelete(interaction),
				'youtube': () => commands.youtube.getYoutubeURL(interaction),
				'reminder': () => commands.reminder.manageReminders(interaction),
				'secretsanta': () => commands.secretsanta.organizeSecretSanta(interaction),
				'roles': () => commands.roles.manageRoles(interaction),
				'channels': () => commands.channels.manageChannels(interaction),
				'webhooks': () => commands.webhooks.manageWebhooks(interaction),
				'integrations': () => commands.integrations.manageIntegrations(interaction),
				//Games commands
				'steam': () => commands.steam.getSteam(interaction),
				'games': () => commands.games.getGames(interaction),
				'deals': () => commands.deals.getDeals(interaction),
				'specs': () => commands.specs.getSpecs(interaction),
				'reviews': () => commands.reviews.getReviews(interaction),
				'hltb': () => commands.howlongtobeat.getHowLongToBeat(interaction),
				//Entertainment commands
				'jokes': () => commands.jokes.getJokes(interaction),
				'reddit': () => commands.reddit.getReddit(interaction),
				'comics': () => commands.comics.getComics(interaction),
				//TV commands
				'tv': () => commands.tv.getTVSeries(interaction),
				'movies': () => commands.movies.getMovies(interaction),
				//Music commands
				'music': () => commands.music.manageMusic(interaction)
			}
			if(!options[command]) throw new Error(`Command /${command} doesn't exist.`);
			return options[command]();
		}
		await executeCommand(interaction.commandName);
	} catch (error) {
		interaction.reply({ content: 'Something went wrong! Please try again later.', ephemeral: true });
		console.log(`${new Date(interaction.createdTimestamp).toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })}: Command that triggered the error: /${interaction.commandName}`);
		console.log(error);	
	}
});

client.on('guildMemberAdd', member => {
	const role = member.guild.roles.cache.find(role => role.name === 'Restrictions');
	if(role) member.roles.add(role);
});

['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => {
    disconnect();
    process.exit(1);
}));