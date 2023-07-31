import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('stop')
	.setDescription('Stop listening for voice commands.');

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const member = interaction.member;
	const voiceChannel = member.voice.channel;
	if (!voiceChannel) throw new Error('You are not in a voice channel.');

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('No queue.');

	const receiver = queue.connection?.receiver;
	if (!receiver) throw new Error('Could not retrieve connection receiver.');

	const isListening = receiver.speaking.listeners('start').length > 0;
	if (!isListening) throw new Error('Not listening to voice commands.');

	receiver.speaking.removeAllListeners('start');

	const embed = new EmbedBuilder().setTitle('Stopped listening for voice commands.');
	await interaction.editReply({ embeds: [embed] });
};
