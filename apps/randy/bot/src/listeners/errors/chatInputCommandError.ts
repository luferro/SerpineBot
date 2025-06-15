import { type ChatInputCommandErrorPayload, type Events, Listener } from "@sapphire/framework";
import { MessageFlags } from "discord.js";

export class ChatInputCommandErrorListener extends Listener<typeof Events.ChatInputCommandError> {
	public run(error: Error, { command, interaction }: ChatInputCommandErrorPayload) {
		this.container.logger.warn({
			guildId: interaction.guildId,
			userId: interaction.user.id,
			commandName: command.name,
			message: `[CHAT_INPUT_COMMAND_ERROR] ${error.message}`,
		});

		if (interaction.deferred || interaction.replied) {
			return interaction.editReply({ content: error.message });
		}

		return interaction.reply({ flags: MessageFlags.Ephemeral, content: error.message });
	}
}
