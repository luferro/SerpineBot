import { MessageEmbed } from 'discord.js';
import { formatStringCapitalize } from '../utils/format.js';

const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

const createPoll = async interaction => {
	const question = interaction.options.getString('question');
	const options = interaction.options.getString('options');

	if(options) {
		const choices = options.split(/ou|or|,|;/);
		if(choices.length <= 1 || choices.length > 10) return interaction.reply({ content: 'Poll allows a minimum of 2 options and a maximum of 10 options.', ephemeral: true });

		const reactions = [];
		const list = choices.map((item, index) => {
			reactions.push(emojis[index]);
			return `> ${emojis[index]} **${item.split(' ').map(formatStringCapitalize).join(' ')}**`
		});

		const message = await interaction.reply({ embeds: [
			new MessageEmbed()
				.setTitle(formatStringCapitalize(question))
				.setDescription(list.join('\n'))
				.setColor('RANDOM')
		], fetchReply: true });
		return addReactions(message, reactions);
	}

	const message = await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(formatStringCapitalize(question))
			.setDescription('👍🏻 or 👎🏻')
			.setColor('RANDOM')
	], fetchReply: true });
	addReactions(message, ['👍🏻', '👎🏻']);
}

const addReactions = (message, reactions) => {
	message.react(reactions[0]);
	reactions.shift();
	if(reactions.length > 0) setTimeout(() => addReactions(message, reactions), 750);
}

export default { createPoll };