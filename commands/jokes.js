const fetch = require('node-fetch');

module.exports = {
    name: 'jokes',
    async getJokes(message, args){
		message.delete({ timeout: 5000 });

		switch(args[1]) {
			case 'dark': {
				const type = Math.floor((Math.random() * 3) + 1);

				switch (type) {
					case 1: {
						try {
							const res = await fetch('https://sv443.net/jokeapi/v2/joke/Dark?type=single');
							const data = await res.json();

							message.channel.send({embed: {
								color: Math.floor(Math.random() * 16777214) + 1,
								author: {
									name: 'Dark Joke'
								},
								title: data.joke
							}});
						} catch (error) {
							console.log(error);
						}
						break;
					}
					case 2: {
						try {
							const res = await fetch('https://sv443.net/jokeapi/v2/joke/Dark?type=twopart');
							const data = await res.json();

							message.channel.send({embed: {
								color: Math.floor(Math.random() * 16777214) + 1,
								author: {
									name: 'Dark Joke'
								},
								title: data.setup,
								description: data.delivery
							}});
						} catch (error) {
							console.log(error);
						}
						break;
					}
					case 3: {
						try {
							const res = await fetch('https://www.reddit.com/r/darkjokes/.json?limit=50&restrict_sr=1');
							const data = await res.json();

							const random = Math.floor(Math.random() * (data.data.children.length - 1));

            				if(data.data.children[random].data.media || data.data.children[random].data.stickied) return await this.getJokes(message, args);
							
							message.channel.send({embed: {
								color: Math.floor(Math.random() * 16777214) + 1,
								author: {
									name: 'Dark Joke - r/darkjokes'
								},
								title: data.data.children[random].data.title,
								description: data.data.children[random].data.selftext 
							}});
						} catch (error) {
							console.log(error);
						} 		
						break;
					}
					default:
						break;
				}
				break;
			}
			case 'prog': {
				const type = Math.floor((Math.random() * 2) + 1);

				switch (type) {
					case 1: {
						try {
							const res = await fetch('https://sv443.net/jokeapi/v2/joke/Programming?type=single');
							const data = await res.json();

							message.channel.send({embed: {
								color: Math.floor(Math.random() * 16777214) + 1,
								author: {
									name: 'Programming Joke'
								},
								title: data.joke
							}});
						} catch (error) {
							console.log(error);
						} 
						break;
					}
					case 2: {
						try {
							const res = await fetch('https://sv443.net/jokeapi/v2/joke/Programming?type=twopart');
							const data = await res.json();

							message.channel.send({embed: {
								color: Math.floor(Math.random() * 16777214) + 1,
								author: {
									name: 'Programming Joke'
								},
								title: data.setup,
								description: data.delivery
							}});
						} catch (error) {
							console.log(error);
						} 
						break;
					}
					default:
						break;
				}
				break;
			}
			case 'misc': {
				const type = Math.floor((Math.random() * 2) + 1);

				switch (type) {
					case 1: {
						try {
							const res = await fetch('https://sv443.net/jokeapi/v2/joke/Miscellaneous?type=single');
							const data = await res.json();

							message.channel.send({embed: {
								color: Math.floor(Math.random() * 16777214) + 1,
								author: {
									name: 'Miscellaneous Joke'
								},
								title: data.joke
							}});
						} catch (error) {
							console.log(error);
						}
						break;
					}
					case 2: {
						try {
							const res = await fetch('https://sv443.net/jokeapi/v2/joke/Miscellaneous?type=twopart');
							const data = await res.json();

							message.channel.send({embed: {
								color: Math.floor(Math.random() * 16777214) + 1,
								author: {
									name: 'Miscellaneous Joke'
								},
								title: data.setup,
								description: data.delivery
							}});
						} catch (error) {
							console.log(error);
						}
						break;
					}
					default:
						break;
				}
				break;
			}
			case 'dad': {
				try {
					const res = await fetch('https://icanhazdadjoke.com/', 
					{
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						method: 'GET'
					});
					const data = await res.json();
		
					message.channel.send({embed: {
						color: Math.floor(Math.random() * 16777214) + 1,
						author: {
							'name': 'Dad Joke'
						},
						title: data.joke
					}});
				} catch (error) {
					console.log(error);
				}
				break;
			}
			case 'yomomma': {
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
				break;
			}
			default:
				message.channel.send('Usage: ./joke <Jokes category: \'dark\', \'misc\', \'prog\', \'dad\' or \'yomomma\'>').then(m => {m.delete({ timeout: 5000 })});
				break;
		}
    }
}