import { Action } from '@luferro/database';
import { ChannelType, EmbedBuilder, SlashCommandSubcommandBuilder, TextChannel } from 'discord.js';

import { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('unassign')
	.setDescription('Unassign a bot message from a text channel.')
	.addIntegerOption((option) =>
		option
			.setName('category')
			.setDescription('Message category.')
			.setRequired(true)
			.addChoices(
				{ name: 'Roles', value: Action.Roles },
				{ name: 'Birthdays', value: Action.Birthdays },
				{ name: 'Leaderboards', value: Action.Leaderboards },
			),
	)
	.addChannelOption((option) =>
		option
			.setName('channel')
			.setDescription('Text channel to be unassigned from the message category.')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);

export const execute: CommandExecute = async ({ client, interaction }) => {
	const channel = interaction.options.getChannel('channel', true) as TextChannel;
	const category = interaction.options.getInteger('category', true) as Action;

	await client.settings.message().withGuild(interaction.guild).delete({ category, channel });

	const embed = new EmbedBuilder().setTitle(`Message unassigned from ${channel.name}.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
