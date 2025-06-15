import { Command } from "@sapphire/framework";

export class VolumeCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "volume",
			preconditions: ["SelfAndUserInSameVoiceChannel", "QueueInitialized"],
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("volume")
					.setDescription("Set player's volume")
					.addIntegerOption((option) =>
						option
							.setName("to")
							.setDescription("New value for volume")
							.setMinValue(0)
							.setMaxValue(100)
							.setRequired(true),
					),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const volume = interaction.options.getInteger("to", true);

		const { node } = this.container.player.getQueue(interaction.guildId!, true);

		const result = node.setVolume(volume);
		if (!result) throw new Error("Cannot change volume.");

		return interaction.reply(`Volume changed to ${volume}%`);
	}
}
