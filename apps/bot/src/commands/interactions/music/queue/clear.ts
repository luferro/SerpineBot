import { SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { Bot } from '../../../../structures/Bot';
import type { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.music.queue.clear.name'))
	.setDescription(t('interactions.music.queue.clear.description'))
	.addBooleanOption((option) =>
		option
			.setName(t('interactions.music.queue.clear.options.0.name'))
			.setDescription(t('interactions.music.queue.clear.options.0.description')),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const self = interaction.options.getBoolean(data.options[0].name);

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error(t('errors.player.node'));

	if (!self) queue.tracks.clear();
	else queue.tracks.remove((track) => track.requestedBy?.id === interaction.user.id);

	await Bot.commands.interactions.methods.get('music.queue.list')?.execute({ client, interaction });
};
