import { Precondition } from "@sapphire/framework";
import type { CommandInteraction, GuildMember } from "discord.js";

export class UserInVoiceChannelPrecondition extends Precondition {
	public override async chatInputRun(interaction: CommandInteraction) {
		const member = interaction.member as GuildMember | null;
		if (!member) return this.error({ message: "Could not retrieve guild member." });
		if (!member.voice.channel) return this.error({ message: "You must be in a voice channel for this interaction." });
		return this.ok();
	}
}
