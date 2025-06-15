import { Precondition } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";

export class QueueInitializedPrecondition extends Precondition {
	public override async chatInputRun(interaction: CommandInteraction) {
		if (!interaction.guildId) return this.error({ message: "Not running in guild context." });

		const queue = this.container.player.getQueue(interaction.guildId);
		if (!queue) return this.error({ message: "Player has not initialized a queue for this guild." });

		return this.ok();
	}
}
