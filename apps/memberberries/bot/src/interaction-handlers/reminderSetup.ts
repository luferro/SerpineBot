import { isDate } from "@luferro/utils/date";
import { toSeconds } from "@luferro/utils/time";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { parseDate } from "chrono-node";
import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import { reminders } from "~/db/schema.js";

export class ReminderSetupHandler extends InteractionHandler {
	constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
		});
	}

	override async parse(interaction: ModalSubmitInteraction) {
		if (interaction.customId !== "reminder-setup") return this.none();

		const relativeDate = interaction.fields.getTextInputValue("reminder-in");
		const dueAt = parseDate(`in ${relativeDate}`);
		if (!isDate(dueAt) || dueAt.getTime() <= Date.now()) throw new Error("Invalid due date.");

		const message = await this.getMessage(interaction).catch(() => null);
		if (!message) throw new Error("Could not retrieve message.");

		return this.some({ dueAt, message });
	}

	async run(interaction: ModalSubmitInteraction, { dueAt, message }: InteractionHandler.ParseResult<this>) {
		const content = typeof message !== "string" ? message.content : message;
		const apiEmbeds = typeof message !== "string" ? message.embeds.map((embed) => embed.toJSON()) : null;
		await this.container.db.insert(reminders).values({ userId: interaction.user.id, content, apiEmbeds, dueAt });

		await interaction.reply({
			flags: MessageFlags.Ephemeral,
			content: `We'll remind you on <t:${toSeconds(dueAt.getTime())}:F>! 'Member? Oh, you'll 'member!`,
		});
	}

	private async getMessage(interaction: ModalSubmitInteraction) {
		try {
			return interaction.fields.getTextInputValue("reminder-message");
		} catch (error) {
			const messageId = interaction.fields.getTextInputValue("reminder-message-id");
			return await interaction.channel?.messages.fetch(messageId);
		}
	}
}
