import { SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('join')
	.setDescription('Bot joins your voice channel.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	if (client.player.nodes.has(interaction.guild.id)) throw new Error("I'm already connected to a voice channel.");

	const memberVoiceChannel = interaction.member.voice.channel;
	if (!memberVoiceChannel) throw new Error('You are not in a voice channel.');

	const queue = client.player.nodes.create(interaction.guild.id, { leaveOnEmptyCooldown: 1000 * 60 * 5 });
	await queue.connect(memberVoiceChannel);

	await interaction.reply({ content: 'I have joined your voice channel. ', ephemeral: true });
};
