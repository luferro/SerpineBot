import { Command } from "@sapphire/framework";

export class PauseCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "pause",
			preconditions: ["SelfAndUserInSameVoiceChannel", "QueueInitialized"],
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => builder.setName("pause").setDescription("Pause current track"), {
			guildIds: this.container.guildIds,
		});
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const { currentTrack, node } = this.container.player.getQueue(interaction.guildId!, true);
		if (!currentTrack) throw new Error("No current track to pause.");
		if (node.isPaused()) throw new Error("Track is already paused.");

		node.setPaused(true);

		const emoji = await this.container.getEmoji("pause");
		return interaction.reply(
			`${emoji} Paused [\`${currentTrack.author} - ${currentTrack.title}\`](<${currentTrack.url}>)`,
		);
	}
}
