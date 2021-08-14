require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const { connect, disconnect } = require('./utils/mongoose');

const prefixes = ['./', '.', '/', '$'];
const client = new Discord.Client();

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', async () => {
	await connect();
	client.user.setActivity(`./cmd`);
	
	await client.commands.get('roles').setupRoles(client);

	setInterval(async() => {
		await client.commands.get('reminder').checkReminder(client);
	}, 10000);
});

client.on('guildMemberAdd', member => {
	const role = member.guild.roles.cache.find(role => role.name === 'Restrictions');
	member.roles.add(role);
})

client.on('message', async (message) => {
	if(!isNaN(message.content) && message.member) client.commands.get('music').search_play(message);

	const filteredPrefixes = prefixes.filter(item => message.content.startsWith(item));
	if(filteredPrefixes.length === 0 || message.author.bot) return;

	const args = message.content.substring(filteredPrefixes[0].length).split(' ');
	
	switch(args[0]) {
		case 'del':
			client.commands.get('del').prune(message, args);
			break;
		case 'joke':
			await client.commands.get('jokes').getJokes(message, args);
			break;
		case 'poll':
			client.commands.get('poll').createPoll(message, args);
			break;
		case 'aww':
			await client.commands.get('aww').getCutePosts(message, args);
			break;
		case 'memes':
			await client.commands.get('memes').getMemes(message, args);
			break;
		case 'specs':
			await client.commands.get('specs').getGameSpecs(message, args);
			break;
		case 'serpine':
			await client.commands.get('serpine').getAuthorRepos(message);
			break;
		case 'github':
			await client.commands.get('github').getGithubRepo(message, args);
			break;
		case 'comics':
			await client.commands.get('comics').getComics(message, args);
			break;
		case 'geturl':
			await client.commands.get('geturl').getURL(message, args);
			break;
		case 'secretsanta':
			await client.commands.get('secretsanta').setupSecretSanta(client, message, args);
			break;
		case 'reminder':
			await client.commands.get('reminder').setupReminder(message, args);
			break;
		case 'reviews':
			await client.commands.get('reviews').getReviews(message, args);
			break;
		case 'join':
			client.commands.get('music').join(message);
			break;
		case 'play':
			client.commands.get('music').setupMusic(message, args);
			break;
		case 'search':
			client.commands.get('music').search(message, args);
			break;
		case 'loop':
			client.commands.get('music').loop(message);
			break;
		case 'skip':
			client.commands.get('music').skip(message);
			break;
		case 'clear':
			client.commands.get('music').clear(message);
			break;
		case 'remove':
			client.commands.get('music').remove(message, args);
			break;
		case 'queue':
			client.commands.get('music').queue(message);
			break;
		case 'resume':
			client.commands.get('music').resume(message);
			break;
		case 'pause':
			client.commands.get('music').pause(message);
			break;
		case 'volume':
			client.commands.get('music').volume(message, args);
			break;
		case 'leave':
			client.commands.get('music').leave(message);
			break;
		case 'cmd':
			client.commands.get('cmd').getHelp(message, args);
			break;
	}
});

['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => {
    disconnect();
    process.exit(1);
}));

client.login(process.env.BOT_TOKEN);
