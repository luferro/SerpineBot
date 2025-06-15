import { type ChatInputCommandDeniedPayload, type Events, Listener } from "@sapphire/framework";
import { MessageFlags } from "discord.js";

export class ChatInputCommandDeniedListener extends Listener<typeof Events.ChatInputCommandDenied> {
	public run(error: Error, { command, interaction }: ChatInputCommandDeniedPayload) {
		this.container.logger.warn({
			guildId: interaction.guildId,
			userId: interaction.user.id,
			commandName: command.name,
			message: `[CHAT_INPUT_COMMAND_DENIED] ${error.message}`,
		});

		if (interaction.deferred || interaction.replied) {
			return interaction.editReply({ content: error.message });
		}

		return interaction.reply({ flags: MessageFlags.Ephemeral, content: error.message });
	}
}
