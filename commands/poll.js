module.exports = {
    name: 'poll',
    createPoll(message, args) {
        if(!args[1]) return message.channel.send('Usage: ./poll <anything>').then(m => { m.delete({ timeout: 5000 }) });
		
		const pollTitle = args.slice(1).join(' ');
		
		message.channel.send({ embed: {
			color: Math.floor(Math.random() * 16777214) + 1,
			title: pollTitle,
			description: '👍🏻 or 👎🏻'
		}}).then(messageReaction => {
			messageReaction.react('👍🏻');
			messageReaction.react('👎🏻');
		});
    }
}