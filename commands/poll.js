module.exports = {
    name: 'poll',
    async execute(message, args){
        if(!args[1]) return message.channel.send('Usage: ./poll <anything>').then(m => {m.delete({ timeout: 5000 })});
		
		let argspoll = args.slice(1).join(" ");
		
		message.channel.send({embed: {
			color: Math.floor(Math.random() * 16777214) + 1,
			title: argspoll,
			description: '👍🏻 or 👎🏻'
		}}).then(messageReaction => {
			messageReaction.react('👍🏻');
			messageReaction.react('👎🏻');
		});
    }
}