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
			...client.connection.config,
		});
		await queue.connect(channel);
	}

	const receiver = queue.connection?.receiver;
	if (!receiver) throw new Error('Could not retrieve connection receiver.');

	const listeningToUser = client.connection.listeningTo.get(member.guild.id);
	client.connection.listeningTo.set(member.guild.id, member.user);

	const handleUserSpeaking = async (userId: string) => {
		const user = client.connection.listeningTo.get(member.guild.id);
		if (user?.id !== userId) return;

		const buffer = await getAudioBuffer({ client, receiver, userId });
		if (buffer.length === 0) return;

		const { speechToText } = client.tools;
		const { transcript, words } = speechToText.process(bufferToInt16(buffer));
		logger.debug(`Transcript for ${userId}: ${transcript}`);
		logger.debug(words);

		const actions = words.map(({ word }) => word);
		const action = actions.shift()!;
		const query = actions.join();

		const queue = client.player.nodes.get(interaction.guild.id)!;
		const commands: Record<string, () => unknown> = {
			play: () =>
				queue.channel && query
					? queue.player.play(queue.channel, query, {
							requestedBy: user,
							nodeOptions: { metadata: interaction.channel },
					  })
					: null,
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

	if (listeningToUser?.id !== interaction.user.id) receiver.speaking.removeListener('start', handleUserSpeaking);

	const isAlreadyListening = receiver.speaking.listeners('start').length > 0;
	if (isAlreadyListening) throw new Error('Already listening for voice commands.');

	receiver.speaking.on('start', handleUserSpeaking);
	const embed = new EmbedBuilder().setTitle('Started listening for voice commands.');
	await interaction.editReply({ embeds: [embed] });
};

const getAudioBuffer = async ({
	client,
	receiver,
	userId,
}: {
	client: Bot;
	receiver: VoiceReceiver;
	userId: string;
}) => {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		const stream = receiver.subscribe(userId, { end: { behavior: EndBehaviorType.AfterSilence, duration: 750 } });

		const decodedStream = new prism.opus.Decoder({ rate: 16000, channels: 1, frameSize: 640 });
		stream.pipe(decodedStream);

		const { wakeWord } = client.tools;

		decodedStream.on('error', (error) => reject(error.message));
		decodedStream.on('data', (chunk) => chunks.push(chunk));
		decodedStream.on('end', () => {
			const buffer: Buffer[] = [];

			let keywordDetected = false;
			for (const frame of getFrames(bufferToInt16(Buffer.concat(chunks)), wakeWord.frameLength)) {
				if (keywordDetected) {
					buffer.push(Buffer.from(frame.buffer));
					continue;
				}

				keywordDetected = wakeWord.process(frame as unknown as Int16Array) !== -1;
			}

			resolve(Buffer.concat(buffer));
		});
	}) as Promise<Buffer>;
};

const getFrames = (array: Int16Array, frameLength: number) => {
	const frames = ArrayUtil.splitIntoChunks(array as unknown as number[], frameLength);
	if (frames.at(-1)?.length !== frameLength) {
		frames.pop();
	}
	return frames as unknown as Int16Array[];
};

const bufferToInt16 = (buffer: Buffer) => {
	const int16Array = new Array(buffer.length / 2);
	for (let i = 0; i < buffer.length; i += 2) {
		int16Array[i / 2] = buffer.readInt16LE(i);
	}
	return new Int16Array(int16Array);
};
