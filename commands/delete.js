module.exports = {
    name: 'del',
    prune(message, args) {
        if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply('You don\'t have permissions to use this command. MANAGE_MESSAGES permission required.').then(m => {m.delete({ timeout: 5000 })});
		if(!args[1]) return message.channel.send('./cmd del');

		const amount = parseInt(args[1]);
		if(isNaN(amount)) return message.channel.send('Not a valid number.').then(m => { m.delete({ timeout: 5000 }) });
		if(amount < 1 || amount > 100) return message.channel.send('Invalid quantity. Choose between 1 and 100 messages').then(m => { m.delete({ timeout: 5000 }) });

		message.channel.bulkDelete(amount == 100 ? amount : amount + 1, true).catch(error => { console.error(error); });
    },
	async pruneBot(message, args) {
		if(!args[1]) return message.channel.send('./cmd del');
		if(!/\d{18,}/.test(args[1])) return message.channel.send('Invalid message ID.').then(m => { m.delete({ timeout: 5000 }) });

		try {
			const data = await message.channel.messages.fetch(args[1]);
			data.delete();
		} catch (error) {
			console.log(error);
		}
	}
}