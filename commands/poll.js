const { formatStringCapitalize } = require('../utils/format');
const { erase } = require('../utils/message');

const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

module.exports = {
    name: 'poll',
    createPoll(message, args) {
		erase(message, 5000);

		if(!args[1]) return message.channel.send('./cmd poll');

		const questionMarkIndex = args.findIndex(item => item.includes('?'));
		if(questionMarkIndex === -1) return message.channel.send('Poll title must include a question mark.').then(m => { m.delete({ timeout: 5000 }) });

		const title = args.slice(1, questionMarkIndex + 1);
		const optionsKeywords = args.slice(questionMarkIndex + 1)

		if(optionsKeywords.length === 0) {
			return message.channel.send({ embed: {
				color: Math.floor(Math.random() * 16777214) + 1,
				title: formatStringCapitalize(title.join(' ')),
				description: '👍🏻 or 👎🏻'
			}}).then(message => {
				message.react('👍🏻');
				message.react('👎🏻');
			});
		}
		
		const options = optionsKeywords.join(' ').split(/ou|or|,/);
		if(options.length > 10) return message.channel.send('Poll can\'t have more than 10 options.').then(m => { m.delete({ timeout: 5000 }) });
		if(options.length === 1) return message.channel.send('Poll needs more than 1 option.').then(m => { m.delete({ timeout: 5000 }) });

		let text = '';
		const reactions = [];
		options.forEach((item, index) => {
            reactions.push(emojis[index]);
			text += `\n${emojis[index]} - **${item.split(' ').map(formatStringCapitalize).join(' ')}**`
		});

		message.channel.send({ embed: {
			color: Math.floor(Math.random() * 16777214) + 1,
			title: formatStringCapitalize(title.join(' ')),
			description: text
		}}).then(message => {
			this.addReactions(message, reactions);
		});
    },
	addReactions(message, reactions) {
        message.react(reactions[0]);
        reactions.shift();
        if(reactions.length > 0) setTimeout(() => this.addReactions(message, reactions), 750);
    }
}