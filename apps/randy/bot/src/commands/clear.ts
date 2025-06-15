import { Command } from "@sapphire/framework";

export class ClearCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "clear",
			preconditions: ["SelfAndUserInSameVoiceChannel", "QueueInitialized", "QueueNotEmpty"],
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) => builder.setName("clear").setDescription("Removes all tracks from queue"),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const { node } = this.container.player.getQueue(interaction.guildId!, true);

		const queueSize = node.queue.size;
		node.queue.clear();

		return interaction.reply(`${queueSize} track(s) removed`);
	}
}
