import { PaginatedMessageEmbedFields } from "@sapphire/discord.js-utilities";
import { Command } from "@sapphire/framework";

export class QueueCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "queue",
			preconditions: ["SelfAndUserInSameVoiceChannel", "QueueInitialized"],
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) => builder.setName("queue").setDescription("Checkout what's currently playing and what's coming next!"),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const { node, currentTrack } = this.container.player.getQueue(interaction.guildId!, true);
		if (!currentTrack) throw new Error("No current track.");

		const trackTitle = currentTrack.title.includes(currentTrack.author)
			? currentTrack.title
			: `${currentTrack.author} - ${currentTrack.title}`;
		const progressBar = node.createProgressBar() ?? "";

		const paginatedMessage = new PaginatedMessageEmbedFields()
			.setTemplate({
				title: trackTitle,
				url: currentTrack.url,
				thumbnail: {
					url: currentTrack.thumbnail,
				},
				description: node.queue.isEmpty() ? progressBar : progressBar.concat("\nQueue"),
			})
			.setItems(
				node.queue.tracks.map((track, index) => {
					const trackTitle = track.title.includes(track.author) ? track.title : `${track.author} - ${track.title}`;

					return {
						name: `\`${index + 1}.\` [${trackTitle}](${track.url}) (${track.duration})`,
						value: `Requested by ${track.requestedBy}`,
						inline: false,
					};
				}),
			)
			.setItemsPerPage(5);
		return paginatedMessage.make().run(interaction);
	}
}
