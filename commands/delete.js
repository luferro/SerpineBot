module.exports = {
    name: 'del',
    async execute(message, args){
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply("You don't have permissions to use this command. MANAGE_MESSAGES permission required.").then(m => {m.delete({ timeout: 5000 })});
			
			if(!args[1]) return message.channel.send('Usage: ./del <quantity>').then(m => {m.delete({ timeout: 5000 })});

			const amount = parseInt(args[1]);

			if (isNaN(amount)) {
				return message.channel.send('Not a valid number.').then(m => {m.delete({ timeout: 5000 })});
			} else if (amount < 1 || amount > 100) {
				return message.channel.send('Invalid quantity. Choose between 1 and 100 messages').then(m => {m.delete({ timeout: 5000 })});
			}

			message.channel.bulkDelete(amount == 100 ? amount : amount + 1, true).catch(error => {
				console.error(error);
				message.channel.send('There was an error when deleting the messages.').then(m => {m.delete({ timeout: 5000 })});;
			});
    }
}