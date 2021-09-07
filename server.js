require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const { connect, disconnect } = require('./utils/mongoose');
const { schedule } = require('./utils/schedule');

const prefixes = ['./', '.', '/', '$'];
const client = new Discord.Client();

client.worker = new Discord.Collection();
const workerFiles = fs.readdirSync('./worker/').filter(file => file.endsWith('.js'));
for (const file of workerFiles) {
	const worker = require(`./worker/${file}`);
	client.worker.set(worker.name, worker);
}

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', async () => {
	try {
		await connect();
		client.worker.get('roles').setup(client);

		schedule('10 * * * * *', () => client.worker.get('reminders').checkReminder(client));
		schedule('30 7-23 * * *', () => client.worker.get('wishlists').checkWishlist(client));
		schedule('0 7-23/5 * * *', () => client.worker.get('subscriptions').getSubscriptions());
	} catch (error) {
		console.log(error);
	}
});

client.on('guildMemberAdd', (member) => {
	const role = member.guild.roles.cache.find(role => role.name === 'Restrictions');
	member.roles.add(role);
});

client.on('message', (message) => {
	client.commands.get('music').searchPlay(message);

	const filteredPrefixes = prefixes.filter(item => message.content.startsWith(item));
	if(filteredPrefixes.length === 0 || (message.author.bot && !message.content.startsWith('./cmd'))) return;

	const args = message.content.substring(filteredPrefixes[0].length).split(' ');
	switch(args[0]) {
		//Useful tools commands
		case 'del': return client.commands.get('del').prune(message, args);
		case 'delBot': return client.commands.get('del').pruneBot(message, args);
		case 'poll': return client.commands.get('poll').createPoll(message, args);
		case 'youtube': return client.commands.get('youtube').getYoutubeURL(message, args);
		case 'reminder': return client.commands.get('reminder').setup(message, args);
		case 'secretsanta': return client.commands.get('secretsanta').setup(client, message, args);
		//Games commands
		case 'steam': return client.commands.get('steam').getSteam(client, message, args);
		case 'games': return client.commands.get('games').getGames(message, args);
		case 'deals': return client.commands.get('deals').getDeals(message, args);
		case 'specs': return client.commands.get('specs').getGameSpecs(message, args);
		case 'reviews': return client.commands.get('reviews').getReviews(message, args);
		case 'hltb': return client.commands.get('howlongtobeat').getHowLongToBeat(message, args);
		//TV commands
		case 'tv': return client.commands.get('tv').getTVShows(message, args);	
		case 'movies': return client.commands.get('movies').getMovies(message, args);
		//Entertainment commands
		case 'aww': return client.commands.get('aww').getCutePosts(message, args);
		case 'jokes': return client.commands.get('jokes').getJokes(message, args);
		case 'memes': return client.commands.get('memes').getMemes(message, args);
		case 'comics': return client.commands.get('comics').getComics(message, args);
		//Music commands
		case 'join': return client.commands.get('music').join(message);
		case 'leave': return client.commands.get('music').leave(message);
		case 'loop': return client.commands.get('music').loop(message);
		case 'skip': return client.commands.get('music').skip(message);
		case 'queue': return client.commands.get('music').queue(message);
		case 'pause': return client.commands.get('music').pause(message);
		case 'resume': return client.commands.get('music').resume(message);
		case 'volume': return client.commands.get('music').volume(message, args);
		case 'remove': return client.commands.get('music').remove(message, args);
		case 'clear': return client.commands.get('music').clear(message);
		case 'search': return client.commands.get('music').search(message, args);
		case 'play': return client.commands.get('music').setup(message, args);
		//Help command
		case 'cmd': return client.commands.get('cmd').getHelp(message, args);
		default: return;
	}
});

['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => {
    disconnect();
    process.exit(1);
}));

client.login(process.env.BOT_TOKEN);
