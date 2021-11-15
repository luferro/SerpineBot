import { MessageEmbed } from 'discord.js';
import { erase } from '../utils/message.js';
import { formatStringCapitalize } from '../utils/format.js';

const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

const createPoll = (message, args) => {
	erase(message, 5000);

	if(!args[1]) return message.channel.send({ content: './cmd poll' });

	const questionMarkIndex = args.findIndex(item => item.includes('?'));
	if(questionMarkIndex === -1) return message.channel.send({ content: 'Poll title must include a question mark.' }).then(m => erase(m, 5000));

	const title = args.slice(1, questionMarkIndex + 1);
	const optionsKeywords = args.slice(questionMarkIndex + 1);

	if(optionsKeywords.length === 0) {
		return message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle(formatStringCapitalize(title.join(' ')))
					.setDescription('👍🏻 or 👎🏻')
					.setColor(Math.floor(Math.random() * 16777214) + 1)
			]
		}).then(message => addReactions(message, ['👍🏻', '👎🏻']));
	}

	const options = optionsKeywords.join(' ').split(/ou|or|,|;/);
	if(options.length <= 1 || options.length > 10) return message.channel.send('Poll allows a minimum of 2 options and a maximum of 10 options.').then(m => erase(m, 5000));

	let text = '';
	const reactions = [];
	options.forEach((item, index) => {
		reactions.push(emojis[index]);
		text += `\n${emojis[index]} - **${item.split(' ').map(formatStringCapitalize).join(' ')}**`;
	});

	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setTitle(formatStringCapitalize(title.join(' ')))
				.setDescription(text)
				.setColor(Math.floor(Math.random() * 16777214) + 1)
		]
	}).then(message => addReactions(message, reactions));
}

const addReactions = (message, reactions) => {
	message.react(reactions[0]);
	reactions.shift();
	if(reactions.length > 0) setTimeout(() => addReactions(message, reactions), 750);
}

export default { createPoll };