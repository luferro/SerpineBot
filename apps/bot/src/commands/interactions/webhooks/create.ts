import { WebhookType } from "@luferro/database";
import { enumToArray } from "@luferro/helpers/transform";
import { ChannelType, EmbedBuilder, SlashCommandSubcommandBuilder, type TextChannel } from "discord.js";
import { t } from "i18next";
import type { InteractionCommandData, InteractionCommandExecute } from "~/types/bot.js";

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t("interactions.webhooks.create.name"))
	.setDescription(t("interactions.webhooks.create.description"))
	.addStringOption((option) =>
		option
			.setName(t("interactions.webhooks.create.options.0.name"))
			.setDescription(t("interactions.webhooks.create.options.0.description"))
			.setRequired(true)
			.addChoices(...enumToArray(WebhookType).map((webhook) => ({ name: webhook, value: webhook }))),
	)
	.addChannelOption((option) =>
		option
			.setName(t("interactions.webhooks.create.options.1.name"))
			.setDescription(t("interactions.webhooks.create.options.1.description"))
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName(t("interactions.webhooks.create.options.2.name"))
			.setDescription(t("interactions.webhooks.create.options.2.description"))
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName(t("interactions.webhooks.create.options.3.name"))
			.setDescription(t("interactions.webhooks.create.options.3.description")),
	)
	.addBooleanOption((option) =>
		option
			.setName(t("interactions.webhooks.create.options.4.name"))
			.setDescription(t("interactions.webhooks.create.options.4.description")),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const type = interaction.options.getString(data.options[0].name, true) as WebhookType;
	const channel = interaction.options.getChannel(data.options[1].name, true) as TextChannel;
	const name = interaction.options.getString(data.options[2].name, true);
	const fields = interaction.options.getString(data.options[3].name);
	const cache = interaction.options.getBoolean(data.options[4].name);

	if (type === WebhookType.NSFW && !channel.nsfw) throw new Error(t("errors.channel.nsfw"));

	const settings = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });
	const webhook = settings?.webhooks.find((webhook) => webhook.type === type || webhook.name === name);
	if (webhook) throw new Error(t("errors.unprocessable"));

	const { id, token } = await channel.createWebhook({ name });
	if (!token) throw new Error(t("errors.webhook.token"));

	await client.prisma.guild.update({
		where: { id: interaction.guild.id },
		data: {
			webhooks: {
				push: {
					type,
					id,
					token,
					name,
					fields: fields ? fields.split(",").map((field) => field.trim()) : ["url"],
					cache: cache ?? true,
				},
			},
		},
	});

	const embed = new EmbedBuilder()
		.setTitle(t("interactions.webhooks.create.embed.title", { channel: channel.name }))
		.setColor("Random");

	await interaction.reply({ embeds: [embed] });
};
