import { type Events, type InteractionHandlerError, Listener } from "@sapphire/framework";
import { MessageFlags } from "discord.js";

export class InteractionHandlerErrorListener extends Listener<typeof Events.InteractionHandlerError> {
	public run(error: Error, { handler, interaction }: InteractionHandlerError) {
		this.container.logger.warn({
			guildId: interaction.guildId,
			userId: interaction.user.id,
			message: `[INTERACTION_HANDLER] [${handler.name.toUpperCase()}] ${error.message}`,
		});

		if ("respond" in interaction) {
			return interaction.respond([]);
		}

		if (interaction.deferred || interaction.replied) {
			return interaction.editReply({ content: error.message });
		}

		return interaction.reply({ flags: MessageFlags.Ephemeral, content: error.message });
	}
}
