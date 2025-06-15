import { Command } from "@sapphire/framework";

export class LeaveCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "leave",
			preconditions: ["SelfAndUserInSameVoiceChannel", "QueueInitialized"],
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => builder.setName("leave").setDescription("Leave voice channel"), {
			guildIds: this.container.guildIds,
		});
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const queue = this.container.player.getQueue(interaction.guildId!, true);

		queue.delete();

		return interaction.reply("Disconnected from voice channel");
	}
}
