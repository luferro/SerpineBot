import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

const getJokes = async interaction => {
	const category = interaction.options.getInteger('category');

	const getCategoryJokes = category => {
        const options = {
            1: { name: 'Dark Joke', url: 'https://sv443.net/jokeapi/v2/joke/Dark' },
            2: { name: 'Programming Joke', url: 'https://sv443.net/jokeapi/v2/joke/Programming' },
            3: { name: 'Miscellaneous Joke', url: 'https://sv443.net/jokeapi/v2/joke/Miscellaneous' }
        };
        return options[category] || null;
    };
    const joke = getCategoryJokes(category);
    if(!joke) return interaction.reply({ content: 'Invalid joke category.', ephemeral: true });

	const res = await fetch(joke.url);
	const data = await res.json();

	if(data.joke) {
		return interaction.reply({ embeds: [
			new MessageEmbed()
				.setAuthor(joke.name)
				.setTitle(data.joke)
				.setColor('RANDOM')
		]});
	}

	interaction.reply({ embeds: [
		new MessageEmbed()
			.setAuthor(joke.name)
			.setTitle(data.setup)
			.setDescription(data.delivery)
			.setColor('RANDOM')
	]});
}

export default { getJokes };