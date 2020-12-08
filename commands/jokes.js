const fetch = require('node-fetch');

module.exports = {
    name: 'joke',
    async execute(message, args){
		switch(args[1]) {
			case 'dark':
				message.delete({ timeout: 5000 });

				let type1 = Math.floor((Math.random() * 3) + 1);

				switch (type1) {
					case 1:
						fetch('https://sv443.net/jokeapi/v2/joke/Dark?type=single')
							.then(response => response.json())
							.then(data => {
								message.channel.send({embed: {
									color: Math.floor(Math.random() * 16777214) + 1,
									author: {
										name: 'Dark Joke'
									},
									title: data.joke
								}})
							})
							.catch(error => {
								message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
								console.log(error);
							});  
						break;
					case 2:
						fetch('https://sv443.net/jokeapi/v2/joke/Dark?type=twopart')
							.then(response => response.json())
							.then(data => {
								message.channel.send({embed: {
									color: Math.floor(Math.random() * 16777214) + 1,
									author: {
										name: 'Dark Joke'
									},
									title: data.setup,
									description: data.delivery
								}})
							})
							.catch(error => {
								message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
								console.log(error);
							});  
						break;
					case 3:
						fetch('https://i.reddit.com/r/darkjokes/.json?limit=50&restrict_sr=1')
							.then(response => response.json())
							.then(data => {		
								let i = Math.floor(Math.random() * Object.keys(data.data.children).length) + 1;
								
								if(data.data.children[i].data.stickied == true || !data.data.children[i].data) i++;
								
								message.channel.send({embed: {
									color: Math.floor(Math.random() * 16777214) + 1,
									author: {
										name: 'Dark Joke - r/darkjokes'
									},
									title: data.data.children[i].data.title,
									description: data.data.children[i].data.selftext 
								}})
							})
							.catch(function(error) {
								message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
								console.log(error);
							});  		
						break;
					default:
						break;
				}
				break;
			case 'prog':
				message.delete({ timeout: 5000 });

				let type2 = Math.floor((Math.random() * 2) + 1);

				switch (type2) {
					case 1:
						fetch('https://sv443.net/jokeapi/v2/joke/Programming?type=single')
							.then(response => response.json())
							.then(data => {
								message.channel.send({embed: {
									color: Math.floor(Math.random() * 16777214) + 1,
									author: {
										name: 'Programming Joke'
									},
									title: data.joke
								}})
							})
							.catch(error => {
								message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
								console.log(error);
							});  
						break;
					case 2:
						fetch('https://sv443.net/jokeapi/v2/joke/Programming?type=twopart')
							.then(response => response.json())
							.then(data => {
								message.channel.send({embed: {
									color: Math.floor(Math.random() * 16777214) + 1,
									author: {
										name: 'Programming Joke'
									},
									title: data.setup,
									description: data.delivery
								}})
							})
							.catch(error => {
								message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
								console.log(error);
							});  
						break;
					default:
						break;
				}
				break;
			case 'misc':
				message.delete({ timeout: 5000 });

				let type3 = Math.floor((Math.random() * 2) + 1);

				switch (type3) {
					case 1:
						fetch('https://sv443.net/jokeapi/v2/joke/Miscellaneous?type=single')
							.then(response => response.json())
							.then(data => {
								message.channel.send({embed: {
									color: Math.floor(Math.random() * 16777214) + 1,
									author: {
										name: 'Miscellaneous Joke'
									},
									title: data.joke
								}})
							})
							.catch(error => {
								message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
								console.log(error);
							});  
						break;
					case 2:
						fetch('https://sv443.net/jokeapi/v2/joke/Miscellaneous?type=twopart')
							.then(response => response.json())
							.then(data => {
								message.channel.send({embed: {
									color: Math.floor(Math.random() * 16777214) + 1,
									author: {
										name: 'Miscellaneous Joke'
									},
									title: data.setup,
									description: data.delivery
								}})
							})
							.catch(error => {
								message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
								console.log(error);
							});
						break;
					default:
						break;
				}
				break;
			case 'dad':
				message.delete({ timeout: 5000 });

				fetch('https://icanhazdadjoke.com/', 
				{
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					method: 'GET'
				})
					.then(response => response.json())
					.then(data => {
						message.channel.send({embed: {
							color: Math.floor(Math.random() * 16777214) + 1,
							author: {
								'name': 'Dad Joke'
							},
							title: data.joke
						}})
					})
					.catch(error => {
						message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
						console.log(error);
					});   
				break;
			case 'yomomma':
				message.delete({ timeout: 5000 });

				fetch('https://api.yomomma.info/')
					.then(response => response.json())
					.then(data => {
						message.channel.send({embed: {
							color: Math.floor(Math.random() * 16777214) + 1,
							author: {
								name: 'Yo Momma Joke'
							},
							title: data.joke
						}})
					})
					.catch(function(error) {
						message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
						console.log(error);
					});  
				break;
			default:
				message.channel.send("Usage: ./joke <category> category: 'dark', 'misc', 'prog', 'dad' or 'yomomma'").then(m => {m.delete({ timeout: 5000 })});
				break;
		}
    }
}