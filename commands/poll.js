module.exports = {
    name: 'poll',
    createPoll(message, args) {
		message.delete({ timeout: 5000 });

        const poll_title = args.slice(1).join(' ');
		if(!poll_title) return message.channel.send('Usage: ./poll <Poll title>').then(m => { m.delete({ timeout: 5000 }) });
		
		message.channel.send({ embed: {
			color: Math.floor(Math.random() * 16777214) + 1,
			title: poll_title,
			description: '👍🏻 or 👎🏻'
		}}).then(messageReaction => {
			messageReaction.react('👍🏻');
			messageReaction.react('👎🏻');
		});
    }
}