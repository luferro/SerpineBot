import { MessageEmbed } from 'discord.js';

const organizeSecretSanta = async interaction => {
	const mentions = interaction.options.getString('mentions');
	const mentionsArray = mentions.match(/\d+/g);

	const uniqueMentions = new Set(mentionsArray);
	if(uniqueMentions.size !== mentionsArray.length) return interaction.reply({ content: 'Duplicated user entry detected.', ephemeral: true });

	const users = [];
	for(const id of mentionsArray) {
		if(!interaction.client.users.cache.has(id)) return interaction.reply({ content: 'Invalid user entry detected.', ephemeral: true });

		const user = await interaction.client.users.fetch(id);
		if(!user.bot) users.push(user);
	}
	if(users.length < 3) return interaction.reply({ content: 'Secret Santa must have at least 3 members.', ephemeral: true });

	const shuffle = array => {
		let currentIndex = array.length;
		while(currentIndex != 0) {
			const randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;
		
			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}
		return array;
	}

	const shuffledUsers = shuffle(users);
	for(const [index, item] of shuffledUsers.entries()) {
		const gifter = shuffledUsers[index];
		const receiver = shuffledUsers[index + 1] || shuffledUsers[0];

		gifter.send({ embeds: [
			new MessageEmbed()
				.setTitle(`Secret Santa ${new Date().getFullYear()}`)
				.addField('Gifts exchange', `**25/12/${new Date().getFullYear()}**`)
				.addField('Value', '**30€**')
				.addField('Prepare a gift for', `**${receiver.tag}**`)
				.addField('**NOTE 1**', 'Update your wishlist.', true)
				.addField('**NOTE 2**', 'You can combine multiple items.', true)
				.setFooter(`${new Date().toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })}`)
				.setColor('RANDOM')
		]});
	}

	interaction.reply({ content: 'A private message has been sent to each user with more details!' });
}

export default { organizeSecretSanta };