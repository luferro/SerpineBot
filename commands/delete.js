module.exports = {
    name: 'del',
	delete(message, args) {
		if((args[1] && args[2])) this.pruneBot(message, args);
		else this.prune(message, args);
	},
    prune(message, args) {
        if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply('You don\'t have permissions to use this command. MANAGE_MESSAGES permission required.').then(m => {m.delete({ timeout: 5000 })});
		if(!args[1]) return message.channel.send('./cmd del');

		const amount = parseInt(args[1]);
		if(isNaN(amount)) return message.channel.send('Not a valid number.').then(m => { m.delete({ timeout: 5000 }) });
		if(amount < 1 || amount > 100) return message.channel.send('Invalid quantity. Choose between 1 and 100 messages').then(m => { m.delete({ timeout: 5000 }) });

		message.channel.bulkDelete(amount == 100 ? amount : amount + 1, true).catch(error => { console.error(error); });
    },
	async pruneBot(message, args) {
		if(!args[1] && !args[2]) return message.channel.send('./cmd del');
		if(!/\d{18,}/.test(args[2])) return message.channel.send('Invalid message ID.').then(m => { m.delete({ timeout: 5000 }) });
		const validOption = ['before', 'after'].some(item => args[1] === item);
		if(!validOption) return message.channel.send('Invalid option. Use keyword before or after.').then(m => { m.delete({ timeout: 5000 }) });
		try {
			const messages = await message.channel.messages.fetch({ limit: 100 });
			const filteredMessages = [...messages].filter(([key, value]) => value.author.id === '785950746331316255');
			const index = filteredMessages.findIndex(([key, value]) => key === args[2]);
			if(index === -1) return message.channel.send(`No message found with ID ${args[2]}.`).then(m => { m.delete({ timeout: 5000 }) });

			const map = new Map(args[1] === 'before' ? filteredMessages.slice(index, messages.size - 1) : filteredMessages.slice(0, index + 1));
			map.forEach(message => message.delete());
		} catch (error) {
			console.log(error);
		}
	}
}