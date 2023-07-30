import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { Bot } from '../../../Bot';
import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';
import { bufferToInt16, getAudioBuffer } from '../../../utils/audio';
import { infereIntent, transcribe } from '../../../utils/speech';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('listen')
	.setDescription('Listen for voice commands.')
	.addBooleanOption((option) => option.setName('stop').setDescription('Stop listening for voice commands'));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const stop = interaction.options.getBoolean('stop');

	const member = interaction.member;
	const guildId = member.guild.id;
	const textChannel = interaction.channel;
	const voiceChannel = member.voice.channel;
	if (!voiceChannel) throw new Error('You are not in a voice channel.');

	let queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) {
		queue = client.player.nodes.create(interaction.guild.id, {
			metadata: textChannel,
			...client.connection.config,
		});
		await queue.connect(voiceChannel);
	}

	const receiver = queue.connection?.receiver;
	if (!receiver) throw new Error('Could not retrieve connection receiver.');

	const listeningToUser = client.connection.listeningTo.get(guildId);
	client.connection.listeningTo.set(guildId, member);

	const handleUserSpeaking = async (userId: string) => {
		const guildMember = client.connection.listeningTo.get(guildId);
		if (guildMember?.id !== userId) return;

		const buffer = await getAudioBuffer({ client, receiver, userId });
		if (buffer.length === 0) return;
		const pcm = bufferToInt16(buffer);

		const intentResult = await infereIntent({ client, pcm });
		const transcribeResult = !intentResult ? await transcribe({ client, pcm }) : null;

		const intent = intentResult?.intent ?? transcribeResult?.intent;
		const slots = intentResult?.slots ?? transcribeResult?.slots ?? {};
		if (!intent) return;

		const command = Bot.commands.voice.get(intent);
		if (!command) return;

		await command.execute({ client, guildId, slots, rest: [userId, voiceChannel, textChannel] });
	};

	if (stop) {
		receiver.speaking.removeListener('start', handleUserSpeaking);
		const embed = new EmbedBuilder().setTitle('Stopped listening for voice commands.');
		await interaction.editReply({ embeds: [embed] });
		return;
	}

	if (listeningToUser?.id !== interaction.user.id) receiver.speaking.removeListener('start', handleUserSpeaking);

	const isAlreadyListening = receiver.speaking.listeners('start').length > 0;
	if (isAlreadyListening) throw new Error('Already listening for voice commands.');

	receiver.speaking.on('start', handleUserSpeaking);
	const embed = new EmbedBuilder().setTitle('Started listening for voice commands.');
	await interaction.editReply({ embeds: [embed] });
};
