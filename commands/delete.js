import { Permissions } from 'discord.js';
import { erase } from '../utils/message.js';

const deleteMessages = async(message, args) => {
	if((args[1] && args[2])) return await pruneBot(message, args);
	prune(message, args);
}

const prune = (message, args) => {
	if(!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return message.reply({ content: 'You don\'t have permissions to use this command. MANAGE_MESSAGES permission required.' }).then(m => erase(m, 5000));
	if(!args[1]) return message.channel.send({ content: './cmd del' });

	const amount = parseInt(args[1]);
	if(isNaN(amount)) return message.channel.send({ content: 'Not a valid number.' }).then(m => erase(m, 5000));
	if(amount < 1 || amount > 100) return message.channel.send({ content: 'Invalid quantity. Choose between 1 and 100 messages.' }).then(m => erase(m, 5000));

	message.channel.bulkDelete(amount == 100 ? amount : amount + 1, true).catch(console.log);
}

const pruneBot = async(message, args) => {
	if(!args[1] && !args[2]) return message.channel.send({ content: './cmd del' });
	if(!/\d{18,}/.test(args[2])) return message.channel.send({ content: 'Invalid message ID.' }).then(m => erase(m, 5000));

	const validOption = ['before', 'after'].some(item => args[1] === item);
	if(!validOption) return message.channel.send({ content: 'Invalid option. Use keyword before or after.' }).then(m => erase(m, 5000));

	const messages = await message.channel.messages.fetch({ limit: 100 });
	const filteredMessages = [...messages].filter(([key, value]) => value.author.id === '785950746331316255');
	const index = filteredMessages.findIndex(([key, value]) => key === args[2]);
	if(index === -1) return message.channel.send({ content: `No message found with ID ${args[2]}.` }).then(m => erase(m, 5000));

	const map = new Map(args[1] === 'before' ? filteredMessages.slice(index, messages.size - 1) : filteredMessages.slice(0, index + 1));
	map.forEach(message => message.delete());
}

export default { deleteMessages };