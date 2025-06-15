import { Command } from "@sapphire/framework";

export class RemoveCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "remove",
			preconditions: ["SelfAndUserInSameVoiceChannel", "QueueInitialized", "QueueNotEmpty"],
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("remove")
					.setDescription("Remove track from queue")
					.addIntegerOption((option) =>
						option.setName("position").setDescription("Track queue position").setMinValue(1).setRequired(true),
					),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const position = interaction.options.getInteger("position", true);

		const { node } = this.container.player.getQueue(interaction.guildId!, true);
		const removedTrack = node.queue.removeTrack(position - 1);
		if (!removedTrack) throw new Error("Cannot remove track.");

		const trackTitle = removedTrack.title.includes(removedTrack.author)
			? removedTrack.title
			: `${removedTrack.author} - ${removedTrack.title}`;

		return interaction.reply(`Removed [\`${trackTitle}\`](<${removedTrack.url}>) from position \`${position}.\``);
	}
}
