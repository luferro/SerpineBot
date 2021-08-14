module.exports = {
	name: 'secretsanta',
	async setupSecretSanta(client, message, args) {
		if(!args[1]) return message.channel.send('Usage: ./secretsanta @user1 @user2 @user3').then(m => {m.delete({ timeout: 5000 })});
		if(!args[3]) return message.channel.send('Secret Santa must have at least 3 members.').then(m => {m.delete({ timeout: 5000 })});
		
		const date = new Date();
		const associations = [];

        const gifters = [];
		for (const key in args) {
            if(key != 0 && args[key] != '') gifters.push(args[key]);
		}

		const uniqueGifters = new Set(gifters);
		if(uniqueGifters.size !== gifters.length) return message.channel.send('Duplicated user entry detected.').then(m => {m.delete({ timeout: 5000 })});
		
		const hasBots = gifters.some(item => item.includes('<@&'));
		if(hasBots) return message.channel.send('Bot entry detected.').then(m => {m.delete({ timeout: 5000 })});

        for (const key in gifters) {
			if(!gifters[key].includes('@')) return message.channel.send('You must mention users to add them to Secret Santa.').then(m => {m.delete({ timeout: 5000 })});
		}

		message.channel.send('A private message will be sent to each user with more details!');
		
		const receivers = [...gifters];
		while (gifters.length > 0) {
			const randomGifters = Math.floor(Math.random() * gifters.length);
			const randomReceivers = Math.floor(Math.random() * receivers.length);

			if(receivers[randomReceivers] !== gifters[randomGifters]) {
				const inverseAssociation = {
					gifter: receivers[randomReceivers],
					receiver: gifters[randomGifters]
				}

				associations.push({
					gifter: gifters[randomGifters],
					receiver: receivers[randomReceivers]
				})

				if(!associations.includes(inverseAssociation)) {
					try {                    					
						const receiver = await client.users.fetch(receivers[randomReceivers].slice(3, receivers[randomReceivers].length - 1));
						const gifter = await client.users.fetch(gifters[randomGifters].slice(3, gifters[randomGifters].length - 1));

						const msg = `
							**Sê bem-vindo(a) ao Secret Santa ${date.getFullYear()} do servidor ${message.guild.name}!**
							\nPrepara uma prenda para o(a) ***${receiver.username}***!\nValor máximo de **25€**.\nTroca de prendas no dia **25/12/${date.getFullYear()}**.\n**Podem combinar vários jogos caso queiram fazer uso do valor máximo.**
							\nCaso existam usernames idênticos e estejas na dúvida de quem é quem, o ID do(a) ***${receiver.username}*** é ***${receiver.id}***.\n**NOTA:** atualizem a vossa wishlist!
							\n*Mensagem enviada às ${date.getHours()}:${date.getMinutes()} do dia ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}*
						`;

						gifter.send(msg);

						receivers.splice(randomReceivers, 1);
						gifters.splice(randomGifters, 1);
					} catch (error) {
						console.log(error);
						break;
					}
				}
			}
		}
	},
};
