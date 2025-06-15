import { Precondition } from "@sapphire/framework";
import type { CommandInteraction, GuildMember } from "discord.js";

export class SelfAndUserInSameVoiceChannelPrecondition extends Precondition {
	public override async chatInputRun(interaction: CommandInteraction) {
		if (!interaction.guild) return this.error({ message: "Not running in guild context." });

		const me = await interaction.guild.members.fetchMe();
		const member = interaction.member as GuildMember | null;
		if (!member) return this.error({ message: "Could not retrieve guild member." });

		const meVoiceChannelId = me.voice.channelId;
		const memberVoiceChannelId = member.voice.channelId;
		if (!meVoiceChannelId || !memberVoiceChannelId) {
			return this.error({ message: "Either you or the bot isn't in a voice channel." });
		}

		if (meVoiceChannelId !== memberVoiceChannelId) {
			return this.error({ message: "You must be in the same voice channel as the bot." });
		}

		return this.ok();
	}
}
