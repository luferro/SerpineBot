import { EnumUtil } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { FiltersName } from 'discord-player';

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
	SURROUNDING = 'surrounding',
	PULSATOR = 'pulsator',
	KARAOKE = 'karaoke',
	MONO = 'mono',
	COMPRESSOR = 'compressor',
	EXPANDER = 'expander',
	SOFT_LIMITER = 'softlimiter',
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
				{ name: 'Off', value: 'off' },
			),
	);

export const execute: CommandExecute = async ({ client, interaction }) => {
	interaction.deferReply({ ephemeral: true });

	const filter = interaction.options.getString('filter') as FiltersName | 'off';

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue || !queue.currentTrack || !queue.filters.ffmpeg) throw new Error(`Cannot toggle \`${filter}\` filter.`);

	if (filter === 'off') await queue.filters.ffmpeg.setFilters(false);
	else await queue.filters.ffmpeg.toggle(filter.includes('bassboost') ? [filter, 'normalizer'] : filter);

	const embed = new EmbedBuilder()
		.setTitle(filter !== 'off' ? `Filter \`${filter}\` has been toggled.` : 'Disabled all filters.')
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
