import { Webhook } from '@luferro/database';
import { ChannelType, EmbedBuilder, SlashCommandSubcommandBuilder, TextChannel } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('create')
	.setDescription('Create a webhook and assign it to a text channel.')
	.addIntegerOption((option) =>
		option
			.setName('category')
			.setDescription('Webhook category.')
			.setRequired(true)
			.addChoices(
				{ name: 'NSFW', value: Webhook.Nsfw },
				{ name: 'Memes', value: Webhook.Memes },
				{ name: 'Anime', value: Webhook.Anime },
				{ name: 'Manga', value: Webhook.Manga },
				{ name: 'World News', value: Webhook.WorldNews },
				{ name: 'Portugal News', value: Webhook.PortugalNews },
				{ name: 'Gaming News', value: Webhook.GamingNews },
				{ name: 'Game Reviews', value: Webhook.Reviews },
				{ name: 'Game Deals', value: Webhook.Deals },
				{ name: 'Free Games', value: Webhook.FreeGames },
				{ name: 'Xbox', value: Webhook.Xbox },
				{ name: 'PlayStation', value: Webhook.PlayStation },
				{ name: 'Nintendo', value: Webhook.Nintendo },
			),
	)
	.addChannelOption((option) =>
		option
			.setName('channel')
			.setDescription('Text channel to receive webhook content.')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);

export const execute: CommandExecute = async ({ client, interaction }) => {
	const category = interaction.options.getInteger('category', true) as Webhook;
	const channel = interaction.options.getChannel('channel', true) as TextChannel;

	await client.settings.webhook().withGuild(interaction.guild).create({ category, channel });

	const embed = new EmbedBuilder().setTitle(`Webhook has been assigned to ${channel.name}.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};
