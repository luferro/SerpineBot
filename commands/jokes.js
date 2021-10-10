const fetch = require('node-fetch');
const { erase } = require('../utils/message');

module.exports = {
    name: 'jokes',
    async getJokes(message, args){
		erase(message, 5000);

		const query = args.slice(1).join(' ').toLowerCase();
		switch(query) {
			case 'dark': return await this.getDarkJoke(message);
			case 'prog':
			case 'programming': return await this.getProgrammingJoke(message);
			case 'misc':
			case 'miscellaneous': return await this.getMiscellaneousJoke(message);
			case 'dad': return await this.getDadJoke(message);
			case 'yomomma':
			case 'yo momma': return await this.getYoMommaJoke(message);
			default: return message.channel.send('./cmd jokes');
		}
    },
	async OnePartJoke(message, url, title) {
		const res = await fetch(url);
		const data = await res.json();

		message.channel.send({embed: {
			color: Math.floor(Math.random() * 16777214) + 1,
			author: {
				name: title
			},
			title: data.joke
		}});
	},
	async TwoPartJoke(message, url, title) {
		const res = await fetch(url);
		const data = await res.json();

		message.channel.send({embed: {
			color: Math.floor(Math.random() * 16777214) + 1,
			author: {
				name: title
			},
			title: data.setup,
			description: data.delivery
		}});
	},
	async getDarkJoke(message) {
		const type = Math.floor((Math.random() * 2) + 1);
		switch (type) {
			case 1: return await this.OnePartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Dark?type=single', 'Dark Joke');
			case 2: return await this.TwoPartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Dark?type=twopart', 'Dark Joke');
			default: return;
		}
	},
	async getProgrammingJoke(message) {
		const type = Math.floor((Math.random() * 2) + 1);
		switch (type) {
			case 1: return await this.OnePartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Programming?type=single', 'Programming Joke');
			case 2: return await this.TwoPartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Programming?type=twopart', 'Programming Joke');
			default: return;
		}
	},
	async getMiscellaneousJoke(message) {
		const type = Math.floor((Math.random() * 2) + 1);

		switch (type) {
			case 1: return await this.OnePartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Miscellaneous?type=single', 'Miscellaneous Joke');
			case 2: return await this.TwoPartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Miscellaneous?type=twopart', 'Miscellaneous Joke');
			default: return;
		}
	},
	async getDadJoke(message) {
		const res = await fetch('https://icanhazdadjoke.com/', { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }});
		const data = await res.json();

		message.channel.send({embed: {
			color: Math.floor(Math.random() * 16777214) + 1,
			author: {
				name: 'Dad Joke'
			},
			title: data.joke
		}});
	},
	async getYoMommaJoke(message) {
		const res = await fetch('https://api.yomomma.info/');
		const data = await res.json();

		message.channel.send({embed: {
			color: Math.floor(Math.random() * 16777214) + 1,
			author: {
				name: 'Yo Momma Joke'
			},
			title: data.joke
		}});
	}
}