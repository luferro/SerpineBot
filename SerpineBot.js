const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

var prefix = './';

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

client.on('message', message => {	
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	
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
		case 'specs':
			client.commands.get('specs').execute(message, args);
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
		case 'cmd':
			client.commands.get('cmd').execute(message, args);
		break;
	}
});

client.login(process.env.BOT_TOKEN);
