import { StringUtil } from "@luferro/shared-utils";
import { EmbedBuilder } from "discord.js";
import { t } from "i18next";

import type { InteractionCommandExecute } from "../../types/bot";

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const posts = await client.api.reddit.getPosts({ subreddit: "Memes" });
	const filteredPosts = posts.filter((post) => !post.isSelf);
	if (filteredPosts.length === 0) throw new Error(t("errors.search.none"));

	const { title, url, selfurl, hasEmbeddedMedia } = filteredPosts[Math.floor(Math.random() * filteredPosts.length)];

	if (hasEmbeddedMedia) {
		await interaction.editReply({ content: `**[${StringUtil.truncate(title)}](<${selfurl}>)**\n${url}` });
		return;
	}

	const embed = new EmbedBuilder()
		.setTitle(StringUtil.truncate(title))
		.setURL(selfurl)
		.setImage(url)
		.setColor("Random");

	await interaction.editReply({ embeds: [embed] });
};
