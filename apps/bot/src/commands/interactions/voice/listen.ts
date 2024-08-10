import { EndBehaviorType } from "discord-voip";
import { EmbedBuilder, SlashCommandSubcommandBuilder, type TextBasedChannel } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

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
		// biome-ignore lint/suspicious/noExplicitAny: esm vs cjs
		await queue.connect(interaction.member.voice.channel as any);
	}

	client.emit("interactionVoiceCreate", { ...interaction, client });

	const receiver = queue.connection?.receiver;
	if (!receiver) throw new Error(t("errors.voice.receiver.none"));

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const isListening = (receiver.speaking as any).listeners("start").length > 0;
	if (isListening) throw new Error(t("errors.voice.listening"));

	receiver.speaking.on("start", async (userId) => {
		const stream = receiver.subscribe(userId, { end: { behavior: EndBehaviorType.AfterSilence, duration: 1000 } });
		const buffer = await client.speech.wakeWord?.detect(stream);
		if (!buffer || buffer?.length === 0) return;

		const intentResult = await client.speech.speechToIntent?.infere(buffer);
		if (!intentResult) throw new Error(t("errors.voice.intent"));

		client.emit("interactionVoiceCreate", { guild: interaction.guild, member: interaction.member, ...intentResult });
	});

	const embed = new EmbedBuilder().setTitle(t("interactions.voice.listen.embed.title"));
	await interaction.reply({ embeds: [embed] });
};
