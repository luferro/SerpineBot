import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, User } from 'discord.js';
import { InteractionError } from '../errors/interactionError';

export const data = {
    name: 'secretsanta',
    client: false,
    slashCommand: new SlashCommandBuilder()
		.setName('secretsanta')
		.setDescription('Organizes a secret santa.')
		.addStringOption(option => option.setName('mentions').setDescription('Mention users participating in this Secret Santa.').setRequired(true))
}

export const execute = async (interaction: CommandInteraction) => {
    const mentions = interaction.options.getString('mentions')!.match(/\d+/g);
    if(!mentions) throw new InteractionError('Invalid input detected.');

	const uniqueMentions = new Set(mentions);
	if(uniqueMentions.size !== mentions.length) throw new InteractionError('Duplicated user entry detected.');

	const users = [];
	for(const id of mentions) {
		if(!interaction.client.users.cache.has(id)) throw new InteractionError('Invalid user entry detected.');

		const user = await interaction.client.users.fetch(id);
		if(!user.bot) users.push(user);
	}
	if(users.length < 3) throw new InteractionError('Secret Santa must have at least 3 members.');

	const shuffledUsers = shuffle(users);
	for(const [index, gifter] of shuffledUsers.entries()) {
		const receiver = shuffledUsers[index + 1] ?? shuffledUsers[0];

		gifter.send({ embeds: [
			new MessageEmbed()
				.setTitle(`Secret Santa ${new Date().getFullYear()}`)
				.addField('Gifts exchange', `**25/12/${new Date().getFullYear()}**`)
				.addField('Value', '**30€**')
				.addField('Prepare a gift for', `**${receiver.tag}**`)
				.addField('**NOTE 1**', 'Update your wishlist.', true)
				.addField('**NOTE 2**', 'You can combine multiple items.', true)
				.setFooter({ text: `${new Date().toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })}` })
				.setColor('RANDOM')
		]});
	}

	await interaction.reply({ content: 'A private message has been sent to each user with more details!' });
}

const shuffle = (array: User[]) => {
    let currentIndex = array.length;
    while(currentIndex != 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
    
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}