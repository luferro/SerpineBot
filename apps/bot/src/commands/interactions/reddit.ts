import { truncate } from "@luferro/helpers/transform";
import { EmbedBuilder, SlashCommandStringOption } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = [
	new SlashCommandStringOption()
		.setName(t("interactions.reddit.options.0.name"))
		.setDescription(t("interactions.reddit.options.0.description"))
		.setRequired(true),
];

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const subreddit = interaction.options.getString(data[0].name, true);

	const posts = await client.api.reddit.getPosts(subreddit);
	const filteredPosts = posts.filter((post) => !post.isSelf && !post.isNsfw);
	if (filteredPosts.length === 0) throw new Error(t("errors.search.none"));

	const { title, url, selfurl, hasEmbeddedMedia } = filteredPosts[Math.floor(Math.random() * filteredPosts.length)];

	if (hasEmbeddedMedia) {
		await interaction.editReply({ content: `**[${truncate(title)}](<${selfurl}>)**\n${url}` });
		return;
	}

	const embed = new EmbedBuilder().setTitle(truncate(title)).setURL(selfurl).setImage(url).setColor("Random");
	await interaction.editReply({ embeds: [embed] });
};
