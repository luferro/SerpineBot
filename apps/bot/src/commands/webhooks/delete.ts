import { Webhook } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('delete')
	.setDescription('Delete a webhook.')
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
	);

export const execute: CommandExecute = async ({ client, interaction }) => {
	const category = interaction.options.getInteger('category', true) as Webhook;

	await client.settings.webhook().withGuild(interaction.guild).delete({ category });

	const embed = new EmbedBuilder().setTitle('Webhook has been deleted.').setColor('Random');
	await interaction.reply({ embeds: [embed] });
};
