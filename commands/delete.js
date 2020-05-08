module.exports = {
    name: 'del',
    async execute(message, args){
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply("You don't have permissions to use this command. MANAGE_MESSAGES permission required.").then(m => {m.delete({ timeout: 5000 })});
			
			if(!args[1]) return message.channel.send("Usage: ./del <quantity>").then(m => {m.delete({ timeout: 5000 })});

			const amount = parseInt(args[1]);
			message.delete({ timeout: 5000 });

			if (isNaN(amount)) {
				return message.reply('Usage: ./del <quantity>.').then(m => {m.delete({ timeout: 5000 })});
			} 
			else if (amount < 1 || amount > 99) {
				message.reply('Invalid quantity.').then(m => {m.delete({ timeout: 5000 })});
				return;
			}

			message.channel.bulkDelete(amount + 1).catch(function(error) {
				message.channel.send('Something went wrong').then(m => {m.delete({ timeout: 5000 })});
			});
    }
}