import { randomUUID } from 'crypto';
import {
	ActionRowBuilder,
	ComponentType,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
	StringSelectMenuBuilder,
	TextBasedChannel,
} from 'discord.js';
import { QueryType, Track } from 'discord-player';
import { t } from 'i18next';

import { Bot } from '../../../Bot';
import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';
import { ExtendedStringSelectMenuInteraction } from '../../../types/interaction';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.music.search.name'))
	.setDescription(t('interactions.music.search.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.music.search.options.0.name'))
			.setDescription(t('interactions.music.search.options.0.description'))
			.setRequired(true)
			.setAutocomplete(true),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const query = interaction.options.getString(t('interactions.music.search.options.0.name'), true);

	const results = await client.player.search(query, { searchEngine: QueryType.AUTO });
	if (!results.hasTracks()) throw new Error(t('errors.search.lookup', { query }));

	const options = [
		...results.tracks.map(({ title, url }) => ({ label: title, value: url })),
		{
			label: t('music.search.menu.option.label'),
			description: t('music.search.menu.option.description', { query }),
			value: 'CANCEL',
		},
	];

	const uuid = randomUUID();
	const stringSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(uuid)
		.setPlaceholder(t('interactions.music.search.menu.placeholder'))
		.addOptions(options);
	const component = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(stringSelectMenu);

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.music.search.embeds.0.title'))
		.setFooter({ text: t('music.search.embeds.0.footer.text') })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed], components: [component] });

	await handleStringSelectMenu({ client, channel: interaction.channel!, uuid, tracks: results.tracks });
};

const handleStringSelectMenu = async ({
	client,
	channel,
	uuid,
	tracks,
}: {
	client: Bot;
	channel: TextBasedChannel;
	uuid: string;
	tracks: Track[];
}) => {
	const interaction = (await channel.awaitMessageComponent({
		time: 60 * 1000,
		componentType: ComponentType.StringSelect,
		filter: ({ customId }) => customId === uuid,
	})) as ExtendedStringSelectMenuInteraction;
	if (!interaction) throw new Error(t('errors.interaction.timeout'));

	const isSearchValid = interaction.values.length > 0 && interaction.values[0] !== 'CANCEL';
	if (!isSearchValid) throw new Error(t('errors.interaction.cancel'));

	const selectedTrack = tracks.find(({ url }) => url === interaction.values[0]);
	if (!selectedTrack) throw new Error(t('errors.search.none'));

	const voiceChannel = interaction.member.voice.channel;
	if (!voiceChannel) throw new Error(t('errors.voice.member.channel'));

	const { track, queue } = await client.player.play(voiceChannel, selectedTrack, {
		requestedBy: interaction.user,
		searchEngine: QueryType.AUTO,
		nodeOptions: { metadata: interaction.channel, ...client.connection.config },
	});

	const position = queue.node.getTrackPosition(track) + 1;

	const embed = new EmbedBuilder()
		.setAuthor({ name: track.author })
		.setTitle(track.title)
		.setURL(track.url)
		.setThumbnail(track.thumbnail)
		.addFields([
			{
				name: `**${t('interactions.music.search.embeds.1.fields.0.name')}**`,
				value: position === 0 ? t('common.player.playback.playing') : position.toString(),
				inline: true,
			},
			{
				name: `**${t('interactions.music.search.embeds.1.fields.1.name')}**`,
				value: track.duration,
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.update({ embeds: [embed], components: [] });
};
