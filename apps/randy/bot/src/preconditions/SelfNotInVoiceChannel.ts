import { Precondition } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";

export class SelfNotInVoiceChannelPrecondition extends Precondition {
	public override async chatInputRun(interaction: CommandInteraction) {
		if (!interaction.guild) return this.error({ message: "Not running in guild context." });

		const me = await interaction.guild.members.fetchMe();
		if (me.voice.channel) return this.error({ message: "Bot is in a voice channel." });
		return this.ok();
	}
}
