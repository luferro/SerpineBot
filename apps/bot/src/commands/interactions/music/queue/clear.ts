import { SlashCommandSubcommandBuilder } from 'discord.js';

import { Bot } from '../../../../Bot';
import type { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('clear')
	.setDescription('Clears the queue.')
	.addBooleanOption((option) => option.setName('self').setDescription('Only removes tracks added by you.'));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const self = !!interaction.options.getBoolean('self');

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot clear queue.');

	if (!self) queue.tracks.clear();
	else queue.tracks.remove((track) => track.requestedBy?.id === interaction.user.id);

	await Bot.commands.interactions.execute.get('music.queue.list')!({ client, interaction });
};
