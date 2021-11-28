import { Permissions } from 'discord.js';

const bulkDelete = async interaction => {
	const quantity = interaction.options.getInteger('quantity');

	if(!interaction.channel) return interaction.reply({ content: 'Invalid text channel.', ephemeral: true });
	if(!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return interaction.reply({ content: 'MANAGE_MESSAGES permission required.', ephemeral: true });
	if(quantity < 1 || quantity > 100) return interaction.reply({ content: 'Invalid quantity. Choose between 1 and 100 messages.', ephemeral: true });

	interaction.channel.bulkDelete(quantity);

	return interaction.reply({ content: `${quantity} messages have been deleted.`, ephemeral: true });
}

export default { bulkDelete };