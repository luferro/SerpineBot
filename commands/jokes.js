const fetch = require('node-fetch');

module.exports = {
    name: 'jokes',
    async getJokes(message, args){
		message.delete({ timeout: 5000 });

		const joke_query = args.slice(1).join(' ');
		switch(joke_query.toLowerCase()) {
			case 'dark': return this.getDarkJoke(message);
			case 'prog':
			case 'programming': return this.getProgrammingJoke(message);
			case 'misc':
			case 'miscellaneous': return this.getMiscellaneousJoke(message);
			case 'dad': return this.getDadJoke(message);
			case 'yomomma':
			case 'yo momma': return this.getYoMommaJoke(message);
			default: return message.channel.send('./cmd jokes');
		}
    },
	async OnePartJoke(message, url, title) {
		try {
			const res = await fetch(url);
			const data = await res.json();

			message.channel.send({embed: {
				color: Math.floor(Math.random() * 16777214) + 1,
				author: {
					name: title
				},
				title: data.joke
			}});
		} catch (error) {
			console.log(error);
		}
	},
	async TwoPartJoke(message, url, title) {
		try {
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
		} catch (error) {
			console.log(error);
		}
	},
	getDarkJoke(message) {
		const type = Math.floor((Math.random() * 2) + 1);
		switch (type) {
			case 1: return this.OnePartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Dark?type=single', 'Dark Joke');
			case 2: return this.TwoPartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Dark?type=twopart', 'Dark Joke');
			default: return;
		}
	},
	getProgrammingJoke(message) {
		const type = Math.floor((Math.random() * 2) + 1);
		switch (type) {
			case 1: return this.OnePartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Programming?type=single', 'Programming Joke');
			case 2: return this.TwoPartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Programming?type=twopart', 'Programming Joke');
			default: return;
		}
	},
	getMiscellaneousJoke(message) {
		const type = Math.floor((Math.random() * 2) + 1);

		switch (type) {
			case 1: return this.OnePartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Miscellaneous?type=single', 'Miscellaneous Joke');
			case 2: return this.TwoPartJoke(message, 'https://sv443.net/jokeapi/v2/joke/Miscellaneous?type=twopart', 'Miscellaneous Joke');
			default: return;
		}
	},
	async getDadJoke(message) {
		try {
			const res = await fetch('https://icanhazdadjoke.com/', { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }});
			const data = await res.json();

			message.channel.send({embed: {
				color: Math.floor(Math.random() * 16777214) + 1,
				author: {
					name: 'Dad Joke'
				},
				title: data.joke
			}});
		} catch (error) {
			console.log(error);
		}
	},
	async getYoMommaJoke(message) {
		try {
			const res = await fetch('https://api.yomomma.info/');
			const data = await res.json();

			message.channel.send({embed: {
				color: Math.floor(Math.random() * 16777214) + 1,
				author: {
					name: 'Yo Momma Joke'
				},
				title: data.joke
			}});
		} catch (error) {
			console.log(error);
		}
	}
}