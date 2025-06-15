import { Command } from "@sapphire/framework";
import { QueueRepeatMode } from "discord-player";

export class LoopCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "loop",
			preconditions: ["SelfAndUserInSameVoiceChannel", "QueueInitialized"],
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("loop")
					.setDescription("Enable looping for queue")
					.addStringOption((option) =>
						option
							.setName("mode")
							.setDescription("Repeat mode")
							.addChoices([
								{ name: "Off", value: "OFF" },
								{ name: "Track", value: "TRACK" },
								{ name: "Queue", value: "QUEUE" },
								{ name: "Autoplay", value: "AUTOPLAY" },
							])
							.setRequired(true),
					),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const mode = interaction.options.getString("mode", true) as keyof typeof QueueRepeatMode;

		const { node } = this.container.player.getQueue(interaction.guildId!, true);

		node.queue.setRepeatMode(QueueRepeatMode[mode]);

		return interaction.reply(`Loop mode set to ${mode}`);
	}
}
