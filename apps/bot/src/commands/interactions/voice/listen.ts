import { VoiceReceiver } from '@discordjs/voice';
import { logger } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder, TextBasedChannel } from 'discord.js';

import { Bot } from '../../../Bot';
import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';
import { bufferToInt16, getAudioBuffer } from '../../../utils/audio';
import { infereIntent, transcribe } from '../../../utils/speech';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('listen')
	.setDescription('Listen for voice commands.');

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const member = interaction.member;
	const guildId = member.guild.id;
	const textChannel = interaction.channel;
	const voiceChannel = member.voice.channel;
	if (!voiceChannel) throw new Error('You are not in a voice channel.');

	let queue = client.player.nodes.get<TextBasedChannel>(interaction.guild.id);
	if (!queue) {
		queue = client.player.nodes.create(interaction.guild.id, {
			metadata: textChannel,
			...client.connection.config,
		});
		await queue.connect(voiceChannel);
	}

	const receiver = queue.connection?.receiver;
	if (!receiver) throw new Error('Could not retrieve connection receiver.');

	const isAlreadyListening = receiver.speaking.listeners('start').length > 0;
	if (isAlreadyListening) throw new Error('Already listening for voice commands.');

	receiver.speaking.on('start', (userId) => handleUserVoice({ client, guildId, userId, receiver }));
	const embed = new EmbedBuilder().setTitle('Started listening for voice commands.');
	await interaction.editReply({ embeds: [embed] });
};

const handleUserVoice = async ({
	client,
	guildId,
	userId,
	receiver,
}: {
	client: Bot;
	guildId: string;
	userId: string;
	receiver: VoiceReceiver;
}) => {
	const queue = client.player.nodes.get<TextBasedChannel>(guildId)!;

	const buffer = await getAudioBuffer({ client, receiver, userId });
	if (buffer.length === 0) return;
	const pcm = bufferToInt16(buffer);

	if (client.connection.lockedIn.get(guildId)) return;
	client.connection.lockedIn.set(guildId, true);
	const intentResult = await infereIntent({ client, pcm });
	const transcribeResult = !intentResult ? await transcribe({ client, pcm }) : null;
	client.connection.lockedIn.set(guildId, false);

	const intent = intentResult?.intent ?? transcribeResult?.intent;
	const slots = intentResult?.slots ?? transcribeResult?.slots ?? {};
	if (!intent) return;

	const command = Bot.commands.voice.get(intent);
	if (!command) return;

	const user = client.users.cache.get(userId)?.username ?? userId;
	const guild = client.guilds.cache.get(guildId)?.name ?? guildId;
	logger.info(`Command **${intent}** used by **${user}** in guild **${guild}**.`);

	await command.execute({ client, queue, slots, rest: [userId] }).catch((error) => {
		const embed = new EmbedBuilder()
			.setTitle(`Voice command with intent \`${intent}\` failed.`)
			.setDescription((error as Error).message)
			.setColor('Random');
		queue.metadata.send({ embeds: [embed] });
	});
};
