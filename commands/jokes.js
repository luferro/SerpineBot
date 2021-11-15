import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { erase } from '../utils/message.js';

const getJokes = async(message, args) => {
	erase(message, 5000);

	const query = args.slice(1).join(' ').toLowerCase();
	switch (query) {
		case 'dark': return await getDarkJoke(message);
		case 'prog':
		case 'programming': return await getProgrammingJoke(message);
		case 'misc':
		case 'miscellaneous': return await getMiscellaneousJoke(message);
		case 'dad': return await getDadJoke(message);
		case 'yomomma':
		case 'yo momma': return await getYoMommaJoke(message);
		default: return message.channel.send({ content: './cmd jokes' });
	}
}

const getDarkJoke = async message => {
	const type = Math.floor((Math.random() * 2) + 1);
	switch (type) {
		case 1: return await OnePartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Dark?type=single', 'Dark Joke');
		case 2: return await TwoPartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Dark?type=twopart', 'Dark Joke');
		default: return;
	}
}

const getProgrammingJoke = async message => {
	const type = Math.floor((Math.random() * 2) + 1);
	switch (type) {
		case 1: return await OnePartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Programming?type=single', 'Programming Joke');
		case 2: return await TwoPartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Programming?type=twopart', 'Programming Joke');
		default: return;
	}
}

const getMiscellaneousJoke = async message => {
	const type = Math.floor((Math.random() * 2) + 1);

	switch (type) {
		case 1: return await OnePartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Miscellaneous?type=single', 'Miscellaneous Joke');
		case 2: return await TwoPartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Miscellaneous?type=twopart', 'Miscellaneous Joke');
		default: return;
	}
}

const getDadJoke = async message => {
	const res = await fetch('https://icanhazdadjoke.com/', { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } });
	const data = await res.json();

	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setAuthor('Dad Joke')
				.setTitle(data.joke)
				.setColor(Math.floor(Math.random() * 16777214) + 1)
		]
	});
}

const getYoMommaJoke = async message => {
	const res = await fetch('https://api.yomomma.info/');
	const data = await res.json();

	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setAuthor('Yo Momma Joke')
				.setTitle(data.joke)
				.setColor(Math.floor(Math.random() * 16777214) + 1)
		]
	});
}

const OnePartJoke = async(message, url, title) => {
	const res = await fetch(url);
	const data = await res.json();

	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setAuthor(title)
				.setTitle(data.joke)
				.setColor(Math.floor(Math.random() * 16777214) + 1)
		]
	});
}

const TwoPartJoke = async(message, url, title) => {
	const res = await fetch(url);
	const data = await res.json();

	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setAuthor(title)
				.setTitle(data.setup)
				.setDescription(data.delivery)
				.setColor(Math.floor(Math.random() * 16777214) + 1)
		]
	});
}

export default { getJokes };