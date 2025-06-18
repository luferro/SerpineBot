import { Listener } from "@sapphire/framework";
import type { ChatInputSubcommandErrorPayload, SubcommandPluginEvents } from "@sapphire/plugin-subcommands";
import { MessageFlags } from "discord.js";

export class ChatInputCommandErrorListener extends Listener<typeof SubcommandPluginEvents.ChatInputSubcommandError> {
	public run(error: Error, { command, interaction }: ChatInputSubcommandErrorPayload) {
		this.container.logger.warn({
			guildId: interaction.guildId,
			userId: interaction.user.id,
			commandName: command.name,
			message: `[CHAT_INPUT_SUBCOMMAND_ERROR] ${error.message}`,
		});

		if (interaction.deferred || interaction.replied) {
			return interaction.editReply({ content: error.message });
		}

		return interaction.reply({ flags: MessageFlags.Ephemeral, content: error.message });
	}
}
