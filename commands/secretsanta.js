module.exports = {
	name: 'secretsanta',
	async execute(client, message, args) {
        if(!args[3]) return message.channel.send('Secret Santa must have at least 3 members.').then(m => {m.delete({ timeout: 5000 })});

        const gifters = [];
		for (const key in args) {
            if (key != 0 && args[key] != '') gifters.push(args[key]);
		}

        const receivers = [...gifters];

        message.channel.send('A private message will be sent with more details!')

		while (gifters.length > 0) {
			let randomGifters = Math.floor(Math.random() * gifters.length);
			let randomReceivers = Math.floor(Math.random() * receivers.length);

			if (receivers[randomReceivers] !== gifters[randomGifters]) {
				try {                    
                    let receiver = await client.users.fetch(receivers[randomReceivers].slice(3, receivers[randomReceivers].length - 1));
                    console.log(receiver);

                    let msg = `
                        Sê bem-vindo(a) ao Secret Santa ${new Date().getFullYear()} do servidor ${message.guild.name}!\nPrepara uma prenda para o(a) ${receiver.username}!\nValor máximo de 25€.
                        \n\nCaso existam usernames idênticos e estejas na dúvida de quem é quem, o ID do(a) ${receiver.username} é ${receiver.id}
                    `;

                    client.users.fetch(gifters[randomGifters].slice(3, gifters[randomGifters].length - 1)).then(gifter => {
                        gifter.send(msg).then(m => {m.delete({ timeout: 1000*60*5 })}); //TESTES;
                    }); 

					gifters.splice(randomGifters, 1);
					receivers.splice(randomReceivers, 1);
				} catch (error) {
					console.log(error);
				}
			}
		}
	},
};
