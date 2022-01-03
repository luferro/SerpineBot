import { Permissions } from 'discord.js';

const bulkDelete = async interaction => {
	const quantity = interaction.options.getInteger('quantity');

	if(!interaction.channel) return interaction.reply({ content: 'Invalid text channel.', ephemeral: true });
	if(!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return interaction.reply({ content: 'MANAGE_MESSAGES permission required.', ephemeral: true });
	if(quantity < 2 || quantity > 100) return interaction.reply({ content: 'Invalid quantity. Choose between 2 and 100 messages.', ephemeral: true });

	const messages = await interaction.channel.bulkDelete(quantity, true);

	return interaction.reply({ content: `${messages.size} messages have been deleted.`, ephemeral: true });
}

export default { bulkDelete };