import { Command } from "@sapphire/framework";

export class SkipCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "skip",
			preconditions: ["SelfAndUserInSameVoiceChannel", "QueueInitialized"],
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("skip")
					.setDescription("Skip current track")
					.addIntegerOption((option) => option.setName("to").setDescription("Target queue position").setMinValue(1)),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const position = interaction.options.getInteger("to");

		const { currentTrack, node } = this.container.player.getQueue(interaction.guildId!, true);
		if (!currentTrack) throw new Error("No current track to skip.");

		const result = position ? node.skipTo(position - 1) : node.skip();
		if (!result) throw new Error("Cannot skip current track.");

		return interaction.reply(
			`${this.container.getEmoji("skip")} Skipped [\`${currentTrack.author} - ${currentTrack.title}\`](<${currentTrack.url}>)`,
		);
	}
}
