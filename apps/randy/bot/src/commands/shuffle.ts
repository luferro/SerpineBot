import { Command } from "@sapphire/framework";

export class ShuffleCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "shuffle",
			preconditions: ["SelfAndUserInSameVoiceChannel", "QueueInitialized", "QueueNotEmpty"],
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => builder.setName("shuffle").setDescription("Shuffle queue tracks"), {
			guildIds: this.container.guildIds,
		});
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const { node } = this.container.player.getQueue(interaction.guildId!, true);

		node.queue.tracks.shuffle();

		return interaction.reply("Queue has been shuffled");
	}
}
