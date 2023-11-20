import { WebhookType } from '@luferro/database';
import { ArrayUtil } from '@luferro/shared-utils';
import { ChannelType, EmbedBuilder, SlashCommandSubcommandBuilder, TextChannel } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.webhooks.create.name'))
	.setDescription(t('interactions.webhooks.create.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.webhooks.create.options.0.name'))
			.setDescription(t('interactions.webhooks.create.options.0.description'))
			.setRequired(true)
			.addChoices(...ArrayUtil.enumToArray(WebhookType).map((webhook) => ({ name: webhook, value: webhook }))),
	)
	.addChannelOption((option) =>
		option
			.setName(t('interactions.webhooks.create.options.1.name'))
			.setDescription(t('interactions.webhooks.create.options.1.description'))
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const type = interaction.options.getString(data.options[0].name, true) as WebhookType;
	const channel = interaction.options.getChannel(data.options[1].name, true) as TextChannel;

	if (type === WebhookType.NSFW && !channel.nsfw) throw new Error(t('errors.channel.nsfw'));

	const settings = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });
	const webhook = settings?.webhooks.find((webhook) => webhook.type === type);
	if (webhook) throw new Error(t('errors.unprocessable'));

	const name = getWebhookName({ type });
	const { id, token } = await channel.createWebhook({ name });
	if (!token) throw new Error(t('errors.webhook.token'));

	await client.prisma.guild.update({
		where: { id: interaction.guild.id },
		data: { webhooks: { push: { type, id, name, token } } },
	});

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.webhooks.create.embed.title', { channel: `\`${channel.name}\`` }))
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const getWebhookName = ({ type }: { type: WebhookType }) => {
	const options = {
		[WebhookType.ANIME]: 'Anime',
		[WebhookType.BIRTHDAYS]: 'Birthdays',
		[WebhookType.EVENTS]: 'Events',
		[WebhookType.FREE_GAMES]: 'Free Games',
		[WebhookType.GAME_DEALS]: 'Game Deals',
		[WebhookType.GAME_REVIEWS]: 'Game Reviews',
		[WebhookType.GAMING_NEWS]: 'Gaming News',
		[WebhookType.LEADERBOARDS]: 'Leaderboards',
		[WebhookType.MANGA]: 'Manga',
		[WebhookType.MEMES]: 'Memes',
		[WebhookType.NINTENDO]: 'Nintendo',
		[WebhookType.NSFW]: 'Nsfw',
		[WebhookType.PLAYSTATION]: 'PlayStation',
		[WebhookType.XBOX]: 'Xbox',
	};
	return options[type] ?? type;
};
