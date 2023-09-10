import { logger } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder, TextBasedChannel } from 'discord.js';
import { VoiceReceiver } from 'discord-voip';
import { t } from 'i18next';

import { Bot } from '../../../Bot';
import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';
import { bufferToInt16, getAudioBuffer } from '../../../utils/audio';
import { infereIntent, isOutOfVocabularyIntents, transcribe } from '../../../utils/speech';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.voice.listen.name'))
	.setDescription(t('interactions.voice.listen.description'));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const member = interaction.member;
	const guildId = member.guild.id;
	const textChannel = interaction.channel;
	const voiceChannel = member.voice.channel;
	if (!voiceChannel) throw new Error(t('errors.voice.member.channel'));

	let queue = client.player.nodes.get<TextBasedChannel>(interaction.guild.id);
	if (!queue) {
		queue = client.player.nodes.create(interaction.guild.id, {
			metadata: textChannel,
			...client.connection.config,
		});
		await queue.connect(voiceChannel);
	}

	const receiver = queue.connection?.receiver;
	if (!receiver) throw new Error(t('errors.voice.receiver.none'));

	const isAlreadyListening = receiver.speaking.listeners('start').length > 0;
	if (isAlreadyListening) throw new Error(t('errors.voice.listening'));

	receiver.speaking.on('start', (userId) => handleUserVoice({ client, guildId, userId, receiver }));

	const embed = new EmbedBuilder().setTitle(t('interactions.voice.listen.embeds.0.title'));
	await interaction.reply({ embeds: [embed] });
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

	const intentResult = await infereIntent({ client, pcm });
	if (!intentResult) throw new Error(t('errors.voice.intent'));

	const isOutOfVocabularyIntent = isOutOfVocabularyIntents(intentResult.intent);
	const transcribeResult = isOutOfVocabularyIntent ? await transcribe({ client, pcm }) : null;

	const intent = intentResult.intent;
	const slots = transcribeResult?.slots ?? intentResult.slots;

	const command = Bot.commands.voice.get(intent);
	if (!command) return;

	const user = client.users.cache.get(userId)?.username ?? userId;
	const guild = client.guilds.cache.get(guildId)?.name ?? guildId;
	logger.info(`Command **${intent}** used by **${user}** in guild **${guild}**.`);

	await command.execute({ client, queue, slots, rest: [userId] }).catch((error) => {
		const embed = new EmbedBuilder()
			.setTitle(t('interactions.voice.listen.embeds.1.title', { intent: `\`${intent}\`` }))
			.setDescription((error as Error).message)
			.setColor('Random');

		queue.metadata.send({ embeds: [embed] });
	});
};
