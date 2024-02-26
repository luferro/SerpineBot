import { EmbedBuilder, SlashCommandSubcommandBuilder, TextBasedChannel } from "discord.js";
import { EndBehaviorType, VoiceReceiver } from "discord-voip";
import { t } from "i18next";

import { Bot } from "../../../structures/Bot";
import type { InteractionCommandData, InteractionCommandExecute } from "../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.voice.listen.name"))
	.setDescription(t("interactions.voice.listen.description"));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	if (!interaction.member.voice.channel) throw new Error(t("errors.voice.member.channel"));

	let queue = client.player.nodes.get<TextBasedChannel>(interaction.guild.id);
	if (!queue) {
		queue = client.player.nodes.create(interaction.guild.id, {
			metadata: interaction.channel,
			...client.player.defaultNodeOptions,
		});
		await queue.connect(interaction.member.voice.channel);
	}

	client.emit("interactionVoiceCreate", { ...interaction, client });

	const receiver = queue.connection?.receiver;
	if (!receiver) throw new Error(t("errors.voice.receiver.none"));

	const isAlreadyListening = receiver.speaking.listeners("start").length > 0;
	if (isAlreadyListening) throw new Error(t("errors.voice.listening"));

	receiver.speaking.on("start", (userId) =>
		handleUserVoice({ guildId: interaction.guild.id, client, userId, receiver }),
	);

	const embed = new EmbedBuilder().setTitle(t("interactions.voice.listen.embed.title"));
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

	const stream = receiver.subscribe(userId, { end: { behavior: EndBehaviorType.AfterSilence, duration: 1000 } });
	const buffer = await client.speech.wakeWord?.detect(stream);
	if (!buffer || buffer?.length === 0) return;

	const intentResult = await client.speech.speechToIntent?.infere(buffer);
	if (!intentResult) throw new Error(t("errors.voice.intent"));

	// const isOutOfVocabularyIntents = ({ intent }: Intent) => ['music.play'].some((_intent) => _intent === intent);
	// const isOutOfVocabularyIntent = isOutOfVocabularyIntents({ intent: intentResult.intent });
	// const transcribeResult = isOutOfVocabularyIntent ? await client.speech.speechToText.transcribe(pcm) : null;

	const intent = intentResult.intent;
	const slots = intentResult.slots;

	const command = Bot.commands.voice.get(intent);
	if (!command) return;

	client.emit("interactionVoiceCreate", {});

	const user = client.users.cache.get(userId)?.username ?? userId;
	const guild = client.guilds.cache.get(guildId)?.name ?? guildId;
	client.logger.info(`Voice | ${intent} invoked by ${user} in guild ${guild}.`);

	await command.execute({ client, queue, slots, rest: [userId] }).catch((error) => {
		const embed = new EmbedBuilder()
			.setTitle(t("errors.voice.failed", { intent }))
			.setDescription((error as Error).message)
			.setColor("Random");

		queue.metadata.send({ embeds: [embed] });
	});
};
