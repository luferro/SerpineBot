const emojis = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟤', '⚪', '🟠'];

module.exports = {
    name: 'poll',
    createPoll(message, args) {
		message.delete({ timeout: 5000 });

		if(!args[1]) return message.channel.send('./cmd poll');

		const questionMarkIndex = args.findIndex(item => item.includes('?'));
		if(questionMarkIndex === -1) return message.channel.send('Poll title must include a question mark.').then(m => { m.delete({ timeout: 5000 }) });

		const title = args.slice(1, questionMarkIndex + 1);
		const optionsKeywords = args.slice(questionMarkIndex + 1)

		if(optionsKeywords.length === 0) {
			return message.channel.send({ embed: {
				color: Math.floor(Math.random() * 16777214) + 1,
				title: this.capitalize(title.join(' ')),
				description: '👍🏻 or 👎🏻'
			}}).then(message => {
				message.react('👍🏻');
				message.react('👎🏻');
			});
		}
		
		const options = optionsKeywords.join(' ').split(/ou|or|,/);
		if(options.length > 8) return message.channel.send('Poll can\'t have more than 8 options.').then(m => { m.delete({ timeout: 5000 }) });
		if(options.length === 1) return message.channel.send('Poll needs more than 1 option.').then(m => { m.delete({ timeout: 5000 }) });

		let text = '';
		const reactions = [];
		options.forEach((item, index) => {
            reactions.push(emojis[index]);
			text += `\n${emojis[index]} - **${item.split(' ').map(this.capitalize).join(' ')}**`
		});

		message.channel.send({ embed: {
			color: Math.floor(Math.random() * 16777214) + 1,
			title: this.capitalize(title.join(' ')),
			description: text
		}}).then(message => {
			this.addReactions(message, reactions);
		});
    },
	addReactions(message, reactions) {
        message.react(reactions[0]);
        reactions.shift();
        if(reactions.length > 0) setTimeout(() => this.addReactions(message, reactions), 750);
    },
	capitalize(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
}