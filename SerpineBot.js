const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

const prefix = './';

client.commands = new Discord.Collection();
 
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
 
    client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
	client.user.setActivity('./cmd');	
});

client.on('message', async message => {	
	if (message.author.bot) return;

	if(!isNaN(Number(message.content))) client.commands.get('music').search_play(message, Number(message.content));
	
	const args = message.content.substring(prefix.length).split(' ');
	
	switch(args[0]) {
		case 'del':
			client.commands.get('del').execute(message, args);
		break;
		case 'joke':
			client.commands.get('joke').execute(message, args);
		break;
		case 'poll':
			client.commands.get('poll').execute(message, args);
		break;
		case 'flame':
			client.commands.get('flame').execute(message, args);
		break;
		case 'animals':
			client.commands.get('animals').execute(message, args);
		break;
		case 'memes':
			client.commands.get('memes').execute(message, args);
		break;
		case 'deals':
			client.commands.get('deals').execute(message, args);
		break;
		case 'reviews':
			client.commands.get('reviews').execute(message, args);
		break;
		case 'releasing':
			client.commands.get('releasing').execute(message, args);
		break;
		case 'cmpgame':
			client.commands.get('cmpgame').execute(message, args);
		break;
		case 'specs':
			client.commands.get('specs').execute(message, args);
		break;
		case 'serpine':
			client.commands.get('serpine').execute(message, args);
		break;
		case 'github':
			client.commands.get('github').execute(message, args);
		break;
		case 'anime':
			client.commands.get('anime').execute(message, args);
		break;
		case 'comics':
			client.commands.get('comics').execute(message, args);
		break;
		case 'books':
			client.commands.get('books').execute(message, args);
		break;
		case 'ebooks':
			client.commands.get('ebooks').execute(message, args);
		break;
		case 'yesorno':	
			client.commands.get('yesorno').execute(message, args);
		break;
		case 'char':
			client.commands.get('char').execute(message, args);
		break;
		case 'pokecard':
			client.commands.get('pokecard').execute(message, args);
		break;
		case 'news':
			client.commands.get('news').execute(message, args);
		break;
		case 'holidays':
			client.commands.get('holidays').execute(message, args);
		break;
		case 'weather':
			client.commands.get('weather').execute(message, args);
		break;
		case 'join':
			client.commands.get('music').join(message, args);
		break;
		case 'play':
			client.commands.get('music').execute(message, args);
		break;
		case 'search':
			client.commands.get('music').search(message, args);
		break;
		case 'loop':
			client.commands.get('music').loop(message, args);
		break;
		case 'skip':
			client.commands.get('music').skip(message, args);
		break;
		case 'clear':
			client.commands.get('music').clear(message, args);
		break;
		case 'remove':
			client.commands.get('music').remove(message, args);
		break;
		case 'queue':
			client.commands.get('music').queue(message, args);
		break;
		case 'leave':
			client.commands.get('music').leave(message, args);
		break;
		case 'cmd':
			client.commands.get('cmd').execute(message, args);
		break;
	}
});

client.login(process.env.BOT_TOKEN);
