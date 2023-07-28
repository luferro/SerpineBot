import { EndBehaviorType } from '@discordjs/voice';
import { spawn } from 'child_process';
import { SlashCommandSubcommandBuilder } from 'discord.js';
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { resolve } from 'path';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('record')
	.setDescription('Create a recording of yourself.')
	.addStringOption((option) => option.setName('name').setDescription('Recording name.').setRequired(true));

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const filename = interaction.options.getString('name', true);

	const channel = interaction.member.voice.channel;
	if (!channel) throw new Error('You are not in a voice channel.');

	let queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) {
		queue = client.player.nodes.create(interaction.guild.id, {
			metadata: interaction.channel,
			leaveOnEmpty: true,
			leaveOnEmptyCooldown: 1000 * 60 * 5,
			leaveOnEnd: false,
			selfDeaf: false,
			bufferingTimeout: 0,
		});
		await queue.connect(channel, { deaf: false });
	}

	const stream = queue.voiceReceiver?.recordUser(interaction.user.id, {
		mode: 'pcm',
		end: EndBehaviorType.AfterSilence,
	});
	if (!stream) throw new Error('Could not record your sound.');

	const recordings = resolve('recordings');
	if (!existsSync('recordings')) mkdirSync('recordings');
	if (existsSync(`recordings/${filename}.mp3`)) {
		stream.destroy();
		throw new Error(`Sound \`${filename}\` already exists.`);
	}

	const input = `${recordings}/${filename}.pcm`;
	const writer = stream.pipe(createWriteStream(input));
	writer.once('finish', async () => {
		const output = `${recordings}/${filename}.mp3`;
		const args = ['-f', 's16le', '-ar', '44.1k', '-ac', '2', '-i', input, '-strict', '-2', output];

		spawn('ffmpeg', args).on('exit', async () => {
			unlinkSync(input);
			await interaction.editReply({ files: [output] });
		});
	});
};
