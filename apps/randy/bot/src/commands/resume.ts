import { Command } from "@sapphire/framework";

export class ResumeCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "resume",
			preconditions: ["SelfAndUserInSameVoiceChannel", "QueueInitialized"],
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => builder.setName("resume").setDescription("Resume track"), {
			guildIds: this.container.guildIds,
		});
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const { currentTrack, node } = this.container.player.getQueue(interaction.guildId!, true);
		if (!currentTrack) throw new Error("No current track to resume.");
		if (node.isPlaying()) throw new Error("Track is already playing.");

		node.setPaused(false);

		const emoji = await this.container.getEmoji("resume");
		return interaction.reply(
			`${emoji} Resumed [\`${currentTrack.author} - ${currentTrack.title}\`](<${currentTrack.url}>)`,
		);
	}
}
