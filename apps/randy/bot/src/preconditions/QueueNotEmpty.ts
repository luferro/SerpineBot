import { Precondition } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";

export class QueueNotEmptyPrecondition extends Precondition {
	public override async chatInputRun(interaction: CommandInteraction) {
		const guildQueue = this.container.player.getQueue(interaction.guildId!, true);
		if (guildQueue.node.queue.isEmpty()) return this.error({ message: "Queue is empty." });

		return this.ok();
	}
}
