import { Command } from "@sapphire/framework";

export class PreviousCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "previous",
			preconditions: ["SelfAndUserInSameVoiceChannel", "QueueInitialized", "QueueNotEmpty"],
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("previous")
					.setDescription("Go back to the previous track")
					.addBooleanOption((option) => option.setName("preserve").setDescription("Preserve currently playing track")),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const preserve = Boolean(interaction.options.getBoolean("preserve"));

		const { node } = this.container.player.getQueue(interaction.guildId!, true);

		const { previousTrack } = node.queue.history;
		if (!previousTrack) throw new Error("No previous track in the history.");

		await node.queue.history.previous(preserve);

		const trackTitle = previousTrack.title.includes(previousTrack.author)
			? previousTrack.title
			: `${previousTrack.author} - ${previousTrack.title}`;

		return interaction.reply(`Playing [\`${trackTitle}\`](<${previousTrack.url}>) from history`);
	}
}
