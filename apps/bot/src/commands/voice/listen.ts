import { EndBehaviorType, VoiceReceiver } from '@discordjs/voice';
import { ArrayUtil, logger } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import prism from 'prism-media';

import { Bot } from '../../Bot';
import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('listen')
	.setDescription('Listen for voice commands.')
	.addBooleanOption((option) => option.setName('stop').setDescription('Stop listening for voice commands'));

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const stop = interaction.options.getBoolean('stop');

	const member = interaction.member;
	const channel = member.voice.channel;
	if (!channel) throw new Error('You are not in a voice channel.');

	let queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) {
		queue = client.player.nodes.create(interaction.guild.id, {
			metadata: interaction.channel,
			leaveOnEmpty: true,
			leaveOnEmptyCooldown: 1000 * 60 * 5,
			leaveOnEnd: false,
			selfDeaf: false,
			bufferingTimeout: 0,
		});
		await queue.connect(channel);
	}

	const receiver = queue.connection?.receiver;
	if (!receiver) throw new Error('Could not retrieve connection receiver.');

	client.connection.listeningTo.set(member.guild.id, member.user);

	const handleUserSpeaking = async (userId: string) => {
		const listeningTo = client.connection.listeningTo.get(member.guild.id);
		if (listeningTo?.id !== userId) return;

		const buffer = await getSpeechBuffer({ client, receiver, userId });
		if (buffer.length === 0) return;

		const { transcript, words } = client.tools.speechToText.process(bufferToInt16(buffer));
		logger.debug(`Transcript for ${userId}: ${transcript}`);
		logger.debug(words);

		const actions = words.map(({ word }) => word);
		const action = actions.shift()!;
		const query = actions.join();

		const queue = client.player.nodes.get(interaction.guild.id)!;
		const commands: Record<string, () => unknown> = {
			play: () => queue.player.play(queue.channel!, query, { nodeOptions: { metadata: interaction.channel } }),
			skip: () => (!queue.isEmpty() ? queue.node.skip() : null),
			pause: () => queue.node.pause(),
			resume: () => queue.node.resume(),
			previous: () => (!queue.history.isEmpty() ? queue.history.previous() : null),
			clear: () => queue.clear(),
			shuffle: () => queue.tracks.shuffle(),
			destroy: () => queue.delete(),
		};
		if (commands[action]) await commands[action]();
	};

	if (stop) {
		receiver.speaking.removeListener('start', handleUserSpeaking);
		const embed = new EmbedBuilder().setTitle('Stopped listening for voice commands.');
		await interaction.editReply({ embeds: [embed] });
		return;
	}

	const isAlreadyListening = receiver.speaking.listeners('start').length > 0;
	if (isAlreadyListening) throw new Error('Already listening for voice commands.');

	receiver.speaking.on('start', handleUserSpeaking);
	const embed = new EmbedBuilder().setTitle('Started listening for voice commands.');
	await interaction.editReply({ embeds: [embed] });
};

const getSpeechBuffer = async ({
	client,
	receiver,
	userId,
}: {
	client: Bot;
	receiver: VoiceReceiver;
	userId: string;
}) => {
	return new Promise((resolve, reject) => {
		const buffer: Buffer[] = [];
		const stream = receiver.subscribe(userId, { end: { behavior: EndBehaviorType.AfterSilence, duration: 750 } });

		const decodedStream = new prism.opus.Decoder({ rate: 16000, channels: 1, frameSize: 640 });
		stream.pipe(decodedStream);

		let frames: number[] = [];
		decodedStream.on('data', (chunk) => {
			if (buffer.length > 0) {
				buffer.push(chunk);
				return;
			}

			frames = frames.concat(...bufferToInt16(chunk));
			const normalizedFrames = ArrayUtil.splitIntoChunks(frames, client.tools.wakeWord.frameLength);
			if (normalizedFrames.at(-1)?.length !== client.tools.wakeWord.frameLength) frames = normalizedFrames.pop()!;

			for (const frame of normalizedFrames) {
				const isWakeWord = client.tools.wakeWord.process(frame as unknown as Int16Array) !== -1;
				if (isWakeWord) buffer.push(chunk);
			}
		});

		decodedStream.on('error', (error) => reject(error.message));
		decodedStream.on('end', () => resolve(Buffer.concat(buffer)));
	}) as Promise<Buffer>;
};

const bufferToInt16 = (buffer: Buffer) => {
	const int16Array = [];
	for (let i = 0; i < buffer.length; i += 2) {
		int16Array.push(buffer.readInt16LE(i));
	}
	return new Int16Array(int16Array);
};
