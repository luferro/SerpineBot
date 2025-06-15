import { Command } from "@sapphire/framework";
import type { GuildMember, VoiceBasedChannel } from "discord.js";

export class JoinCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "join",
			preconditions: ["UserInVoiceChannel", "SelfNotInVoiceChannel"],
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => builder.setName("join").setDescription("Join your voice channel"), {
			guildIds: this.container.guildIds,
		});
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const newQueue = this.container.player.queues.create(interaction.guildId!);
		const member = interaction.member as GuildMember;
		const voiceChannel = member.voice.channel as VoiceBasedChannel;
		await newQueue.connect(voiceChannel);

		return interaction.reply(`Connected to voice channel ${voiceChannel}`);
	}
}
