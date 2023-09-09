import { EndBehaviorType } from '@discordjs/voice';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { SlashCommandSubcommandBuilder } from 'discord.js';
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { t } from 'i18next';
import { resolve } from 'path';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.soundboard.record.name'))
	.setDescription(t('interactions.soundboard.record.description'));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const channel = interaction.member.voice.channel;
	if (!channel) throw new Error(t('errors.voice.member.channel'));

	const recordings = resolve('recordings');
	if (!existsSync('recordings')) mkdirSync('recordings');

	let queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) {
		queue = client.player.nodes.create(interaction.guild.id, {
			metadata: interaction.channel,
			...client.connection.config,
		});
		await queue.connect(channel, { deaf: false });
	}

	const stream = queue.voiceReceiver?.recordUser(interaction.user.id, {
		mode: 'pcm',
		end: EndBehaviorType.AfterSilence,
		silenceDuration: 1000,
	});
	if (!stream) throw new Error(t('errors.voice.receiver.record'));

	const uuid = randomUUID();
	const input = `${recordings}/${uuid}.pcm`;
	const writer = stream.pipe(createWriteStream(input));
	writer.once('finish', async () => {
		const output = `${recordings}/${uuid}.mp3`;
		const args = ['-f', 's16le', '-ar', '44.1k', '-ac', '2', '-i', input, '-strict', '-2', output];

		spawn('ffmpeg', args).on('exit', () => {
			interaction.editReply({ files: [output] }).then(() => {
				[input, output].forEach((file) => unlinkSync(file));
				stream.destroy();
			});
		});
	});
};
