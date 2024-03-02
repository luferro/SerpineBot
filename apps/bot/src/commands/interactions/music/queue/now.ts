import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "../../../../types/bot";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.music.queue.now.name"))
	.setDescription(t("interactions.music.queue.now.description"));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue?.currentTrack) throw new Error(t("errors.player.node"));

	const { previousTrack, currentTrack } = queue.history;
	const { author, title, url, thumbnail, requestedBy } = currentTrack!;

	const embed = new EmbedBuilder()
		.setAuthor({ name: author })
		.setTitle(title)
		.setURL(url)
		.setThumbnail(thumbnail)
		.setDescription(queue.node.createProgressBar())
		.setFooter({
			iconURL: requestedBy?.avatarURL() ?? requestedBy?.defaultAvatarURL,
			text: t("music.queue.now.embed.footer.text", { requestedBy: requestedBy?.username }),
		})
		.setColor("Random");

	if (previousTrack) {
		embed.addFields([
			{
				name: t("interactions.music.queue.now.embed.fields.0.name"),
				value: `**[${previousTrack.title}](${previousTrack.url})**`,
			},
		]);
	}

	await interaction.reply({ embeds: [embed] });
};
