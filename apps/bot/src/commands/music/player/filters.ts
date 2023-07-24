import { EnumUtil } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { GuildQueue, QueueFilters } from 'discord-player';

import type { CommandData, CommandExecute } from '../../../types/bot';

enum Filters {
	BASSBOOST_LOW = 'bassboost_low',
	BASSBOOST = 'bassboost',
	BASSBOOST_HIGH = 'bassboost_high',
	'8D' = '8D',
	VAPORWAVE = 'vaporwave',
	NIGHTCORE = 'nightcore',
	VIBRATO = 'vibrato',
	REVERSE = 'reverse',
	TREBLE = 'treble',
	NORMALIZER = 'normalizer',
	NORMALIZER2 = 'normalizer2',
	SURROUNDING = 'surrounding',
	PULSATOR = 'pulsator',
	KARAOKE = 'karaoke',
	MONO = 'mono',
	COMPRESSOR = 'compressor',
	EXPANDER = 'expander',
	SOFT_LIMITER = 'softlimiter',
	CHORUS = 'chorus',
	CHORUS_2D = 'chorus2d',
	CHORUS_3D = 'chorus3d',
	FADE_IN = 'fadein',
	DIM = 'dim',
	EAR_RAPE = 'earrape',
	LOFI = 'lofi',
}

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('filters')
	.setDescription('Toggles the selected filter.')
	.addStringOption((option) =>
		option
			.setName('filter')
			.setDescription('Player filter.')
			.addChoices(
				...EnumUtil.enumKeysToArray(Filters).map((filter) => ({ name: filter, value: Filters[filter] })),
			),
	);

export const execute: CommandExecute = async ({ client, interaction }) => {
	interaction.deferReply({ ephemeral: true });

	const filter = interaction.options.getString('filter') as keyof QueueFilters;

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error(`Cannot toggle \`${filter}\` filter.`);

	if (!filter) await resetFilters({ queue });
	else await queue.filters.ffmpeg.toggle(filter);

	const embed = new EmbedBuilder()
		.setTitle(filter ? `Filter \`${filter}\` has been toggled.` : 'Disabled all filters.')
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};

const resetFilters = async ({ queue }: { queue: GuildQueue }) => {
	const enabledFilters = queue.filters.ffmpeg.getFiltersEnabled();
	for (const enabledFilter of enabledFilters) {
		await queue.filters.ffmpeg.toggle(enabledFilter);
	}
};
