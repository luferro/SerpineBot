import { EmbedBuilder, type TextChannel } from "discord.js";
import { t } from "i18next";
import { Bot } from "~/structures/Bot.js";
import type { EventData, EventExecute } from "~/types/bot.js";
import type { ExtendedVoiceInteraction } from "~/types/interaction.js";

type Args = [interaction: ExtendedVoiceInteraction];

export const data: EventData = { listener: "custom", type: "on" };

export const execute: EventExecute<Args> = async ({ client, rest: [{ guild, member, intent, slots }] }) => {
	client.logger.info(`Voice | ${intent} invoked by ${member.user} in guild ${guild}.`);

	const command = Bot.commands.voice.get(intent);
	if (!command) return;

	const queue = client.player.nodes.get<TextChannel>(guild.id)!;

	// const isOutOfVocabularyIntents = ({ intent }: Intent) => ['music.play'].some((_intent) => _intent === intent);
	// const isOutOfVocabularyIntent = isOutOfVocabularyIntents({ intent: intentResult.intent });
	// const transcribeResult = isOutOfVocabularyIntent ? await client.speech.speechToText.transcribe(pcm) : null;

	try {
		await command.execute({ client, queue, slots, rest: [member.user.id] });
	} catch (error) {
		const embed = new EmbedBuilder()
			.setTitle(t("errors.voice.failed", { intent }))
			.setDescription((error as Error).message)
			.setColor("Random");
		await queue.metadata.send({ embeds: [embed] });
	}
};
