import { MessageEmbed } from 'discord.js';
import { erase } from '../utils/message.js';
import { randomUUID } from 'crypto';

const setup = async(client, message, args) => {
	if(!args[1]) return message.channel.send({ content: './cmd secretsanta' });

	const gifters = args.slice(1);
	if(gifters.length < 3) return message.channel.send({ content: 'Secret Santa must have at least 3 members.' }).then(m => erase(m, 5000));

	const isMention = gifters.some(item => item.includes('@'));
	if(!isMention) return message.channel.send({ content: 'You must mention users to add them to Secret Santa.' }).then(m => erase(m, 5000));

	const unique = new Set(gifters);
	if(unique.size !== gifters.length) return message.channel.send({ content: 'Duplicated user entry detected.' }).then(m => erase(m, 5000));

	const hasBots = gifters.some(item => item.includes('<@&'));
	if(hasBots) return message.channel.send({ content: 'Bot entry detected.' }).then(m => erase(m, 5000));

	message.channel.send({ content: 'A private message will be sent to each user with more details!' });

	const date = new Date();
	const associations = [];

	//DEBUG
	const giftersDebug = [], receiversDebug = [], associationsDebug = [];
	gifters.forEach(item => giftersDebug.push(randomUUID()));
	receiversDebug = [...giftersDebug];
	//FIM DEBUG

	const receivers = [...gifters];
	while (gifters.length > 0) {
		const randomGifters = Math.floor(Math.random() * gifters.length);
		const randomReceivers = Math.floor(Math.random() * receivers.length);

		if (receivers[randomReceivers] !== gifters[randomGifters]) {
			const inverseAssociation = { gifter: receivers[randomReceivers], receiver: gifters[randomGifters] };
			associations.push({ gifter: gifters[randomGifters], receiver: receivers[randomReceivers] });

			//DEBUG
			associationsDebug.push({ gifter: giftersDebug[randomGifters], receiver: receiversDebug[randomReceivers] });
			//FIM DEBUG

			if (!associations.includes(inverseAssociation)) {
				const receiver = await client.users.fetch(receivers[randomReceivers].slice(3, receivers[randomReceivers].length - 1));
				const gifter = await client.users.fetch(gifters[randomGifters].slice(3, gifters[randomGifters].length - 1));

				gifter.send({
					embeds: [
						new MessageEmbed()
							.setTitle(`Secret Santa ${date.getFullYear()}`)
							.setDescription(`
								\nPrepara uma prenda para o(a) \`${receiver.tag}\`!
								\nValor máximo de \`30 €\`.
								\nTroca de prendas no dia \`25/12/${date.getFullYear()}\`.\n
								\n**Podem combinar vários jogos caso queiram fazer uso do valor máximo.**
								\n**NOTA:** atualizem a vossa wishlist!
							`)
							.setFooter(`Mensagem enviada: ${new Date(reminder.timeStart).toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })}`)
							.setColor(Math.floor(Math.random() * 16777214) + 1)
					]
				});

				receivers.splice(randomReceivers, 1);
				gifters.splice(randomGifters, 1);
			}
		}
	}
	//DEBUG
	console.log(associationsDebug);
	//FIM DEBUG
}

export default { setup };