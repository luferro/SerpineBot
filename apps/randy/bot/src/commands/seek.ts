import { Command } from "@sapphire/framework";
import parse from "parse-duration";

export class SeekCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "seek",
			preconditions: ["SelfAndUserInSameVoiceChannel", "QueueInitialized"],
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("seek")
					.setDescription("Seek to a specific moment in a track")
					.addIntegerOption((option) =>
						option.setName("to").setDescription("Seek value (e.g. 1m20s)").setRequired(true),
					),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const expression = interaction.options.getString("to", true);

		const { currentTrack, node } = this.container.player.getQueue(interaction.guildId!, true);
		if (!currentTrack) throw new Error("No current track to seek.");

		const ms = parse(expression);
		if (!ms || ms < 0) throw new Error("Invalid seek time expression.");

		const result = node.seek(ms);
		if (!result) throw new Error(`Cannot seek to ${ms} ms.`);

		return interaction.reply(
			`Seeked [\`${currentTrack.author} - ${currentTrack.title}\`](<${currentTrack.url}>) to ${ms} ms`,
		);
	}
}
