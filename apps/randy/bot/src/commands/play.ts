import { Command } from "@sapphire/framework";
import type { GuildMember, VoiceBasedChannel } from "discord.js";

export class PlayCommand extends Command {
	constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			name: "play",
			preconditions: [["SelfAndUserInSameVoiceChannel", ["UserInVoiceChannel", "SelfNotInVoiceChannel"]]],
		});
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName("play")
					.setDescription("Play audio track or add it to the queue")
					.addStringOption((command) =>
						command.setName("query").setDescription("Track query").setRequired(true).setAutocomplete(true),
					),
			{ guildIds: this.container.guildIds },
		);
	}

	async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();

		const query = interaction.options.getString("query", true);

		const member = interaction.member as GuildMember;
		const voiceChannel = member.voice.channel as VoiceBasedChannel;

		const { queue, track } = await this.container.player.play(voiceChannel, query, { requestedBy: interaction.user });

		const trackTitle = track.title.includes(track.author) ? track.title : `${track.author} - ${track.title}`;
		const action = queue.currentTrack?.id !== track.id ? "Queue" : "Now playing";

		return interaction.editReply(
			`${this.container.getEmoji("play")} ${action} [\`${trackTitle}\`](<${track.url}>) (${track.duration})`,
		);
	}
}
