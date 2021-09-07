module.exports = {
	name: 'secretsanta',
	async setup(client, message, args) {
		if(!args[1]) return message.channel.send('./cmd secretsanta');

        const gifters = args.slice(1);
		if(gifters.length < 3) return message.channel.send('Secret Santa must have at least 3 members.').then(m => {m.delete({ timeout: 5000 })});

		const isMention = gifters.some(item => item.includes('@'));
		if(!isMention) return message.channel.send('You must mention users to add them to Secret Santa.').then(m => {m.delete({ timeout: 5000 })});

		const unique = new Set(gifters);
		if(unique.size !== gifters.length) return message.channel.send('Duplicated user entry detected.').then(m => {m.delete({ timeout: 5000 })});

		const hasBots = gifters.some(item => item.includes('<@&'));
		if(hasBots) return message.channel.send('Bot entry detected.').then(m => {m.delete({ timeout: 5000 })});

		message.channel.send('A private message will be sent to each user with more details!');

		const date = new Date();
		const associations = [];
		
		const receivers = [...gifters];
		while(gifters.length > 0) {
			const randomGifters = Math.floor(Math.random() * gifters.length);
			const randomReceivers = Math.floor(Math.random() * receivers.length);

			if(receivers[randomReceivers] !== gifters[randomGifters]) {
				const inverseAssociation = { gifter: receivers[randomReceivers], receiver: gifters[randomGifters] };
				associations.push({ gifter: gifters[randomGifters], receiver: receivers[randomReceivers] });

				if(!associations.includes(inverseAssociation)) {
					try {                    					
						const receiver = await client.users.fetch(receivers[randomReceivers].slice(3, receivers[randomReceivers].length - 1));
						const gifter = await client.users.fetch(gifters[randomGifters].slice(3, gifters[randomGifters].length - 1));

						gifter.send({ embed: {
							color: Math.floor(Math.random() * 16777214) + 1,
							title: `Secret Santa ${date.getFullYear()}`,
							description: `
								Prepara uma prenda para o(a) \`${receiver.tag}\`!
								Valor máximo de \`30 €\`.
								Troca de prendas no dia \`25/12/${date.getFullYear()}\`.\n
								**Podem combinar vários jogos caso queiram fazer uso do valor máximo.**
								**NOTA:** atualizem a vossa wishlist!
							`,
							footer: {
								text: `Mensagem enviada: ${new Date(reminder.timeStart).toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })}`
							}
						}});

						receivers.splice(randomReceivers, 1);
						gifters.splice(randomGifters, 1);
					} catch (error) {
						console.log(error);
						break;
					}
				}
			}
		}
	}
};
