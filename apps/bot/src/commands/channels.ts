import type { ExtendedChatInputCommandInteraction } from '../types/interaction';
import type { CommandData } from '../types/bot';
import type { MessageCategory } from '../types/category';
import type { Guild, SelectMenuInteraction, GuildBasedChannel, TextChannel } from 'discord.js';
import {
	ActionRowBuilder,
	SelectMenuBuilder,
	EmbedBuilder,
	ChannelType,
	ComponentType,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';
import * as RolesJob from '../jobs/roles';
import * as Channels from '../services/channels';
import { CommandName } from '../types/enums';
import { randomUUID } from 'crypto';

export const data: CommandData = {
	name: CommandName.Channels,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Channels)
		.setDescription('Channels related commands.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Create a guild channel.')
				.addStringOption((option) => option.setName('name').setDescription('Channel name.').setRequired(true))
				.addIntegerOption((option) =>
					option
						.setName('type')
						.setDescription('Whether it should be a text or voice channel.')
						.setRequired(true)
						.addChoices(
							{ name: 'Text Channel', value: ChannelType.GuildText },
							{ name: 'Voice Channel', value: ChannelType.GuildVoice },
						),
				)
				.addStringOption((option) => option.setName('topic').setDescription('Topic of the text channel.'))
				.addBooleanOption((option) => option.setName('nsfw').setDescription('Whether the channel is NSFW.')),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('update')
				.setDescription('Update a guild channel.')
				.addChannelOption((option) =>
					option.setName('channel').setDescription('Guild channel.').setRequired(true),
				)
				.addStringOption((option) => option.setName('name').setDescription('Channel name.'))
				.addStringOption((option) => option.setName('topic').setDescription('Topic of the text channel.'))
				.addBooleanOption((option) => option.setName('nsfw').setDescription('Whether the channel is NSFW.')),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('delete')
				.setDescription('Delete a guild channel.')
				.addChannelOption((option) =>
					option.setName('channel').setDescription('Guild channel.').setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('assign')
				.setDescription('Assign a bot message to a text channel.')
				.addStringOption((option) =>
					option
						.setName('category')
						.setDescription('Message category.')
						.setRequired(true)
						.addChoices(
							{ name: 'Roles', value: 'Roles' },
							{ name: 'Leaderboards', value: 'Leaderboards' },
							{ name: 'Birthdays', value: 'Birthdays' },
						),
				)
				.addChannelOption((option) =>
					option.setName('channel').setDescription('Text channel to receive bot message.').setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('dissociate')
				.setDescription('Dissociate a bot message from a text channel.')
				.addStringOption((option) =>
					option
						.setName('category')
						.setDescription('Message category.')
						.setRequired(true)
						.addChoices(
							{ name: 'Roles', value: 'Roles' },
							{ name: 'Leaderboards', value: 'Leaderboards' },
							{ name: 'Birthdays', value: 'Birthdays' },
						),
				)
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('Text channel with the bot message assigned.')
						.setRequired(true),
				),
		),
};

export const execute = async (interaction: ExtendedChatInputCommandInteraction) => {
	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (arg0: typeof interaction) => Promise<void>> = {
		create: createChannel,
		update: updateChannel,
		delete: deleteChannel,
		assign: assignChannel,
		dissociate: dissociateChannel,
	};

	await select[subcommand](interaction);
};

const createChannel = async (interaction: ExtendedChatInputCommandInteraction) => {
	const name = interaction.options.getString('name', true);
	const type = interaction.options.getInteger('type', true) as ChannelType;
	const topic = interaction.options.getString('topic') ?? '';
	const nsfw = interaction.options.getBoolean('nsfw') ?? false;

	await Channels.create(interaction.guild, name, type, topic, nsfw);
	const embed = new EmbedBuilder().setTitle(`Channel ${name} has been created.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const updateChannel = async (interaction: ExtendedChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;
	const name = interaction.options.getString('name', true);
	const topic = interaction.options.getString('topic') ?? '';
	const nsfw = interaction.options.getBoolean('nsfw') ?? false;

	const isTextOrVoiceChannel = channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice;
	if (!isTextOrVoiceChannel) throw new Error('Channel must be a text or voice channel.');

	await Channels.update(channel, name, topic, nsfw);
	const embed = new EmbedBuilder().setTitle(`Channel ${channel.name} has been updated.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const deleteChannel = async (interaction: ExtendedChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;

	const isTextOrVoiceChannel = channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice;
	if (!isTextOrVoiceChannel) throw new Error('Channel must be a text or voice channel.');

	await Channels.remove(channel);
	const embed = new EmbedBuilder().setTitle(`Channel ${channel.name} has been deleted.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const getRoleOptions = (guild: Guild) =>
	[...guild.roles.cache.values()]
		.sort((a, b) => a.position - b.position)
		.filter(({ id, tags }) => id !== guild.roles.everyone.id && tags)
		.map(({ id, name }) => ({ label: name, value: id }));

const getLeaderboardOptions = () => ['Steam', 'Xbox'].map((option) => ({ label: option, value: option }));

const assignChannel = async (interaction: ExtendedChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;
	const category = interaction.options.getString('category', true) as MessageCategory;

	if (channel.type !== ChannelType.GuildText) throw new Error('Channel must be a text channel.');

	if (category === 'Birthdays') await assignChannelWithoutOptions(interaction, channel, category);
	else await assignChannelWithOptions(interaction, channel, category);
};

const assignChannelWithoutOptions = async (
	interaction: ExtendedChatInputCommandInteraction,
	channel: TextChannel,
	category: Extract<MessageCategory, 'Birthdays'>,
) => {
	await Channels.assign(interaction.guild.id, channel, category, []);
	const embed = new EmbedBuilder().setTitle(`${category} has been assigned to ${channel.name}.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const assignChannelWithOptions = async (
	interaction: ExtendedChatInputCommandInteraction,
	channel: TextChannel,
	category: Extract<MessageCategory, 'Roles' | 'Leaderboards'>,
) => {
	const guild = interaction.guild;
	const options = category === 'Roles' ? getRoleOptions(guild) : getLeaderboardOptions();
	if (options.length === 0) throw new Error('Select at least one option from the menu.');

	const uuid = randomUUID();

	const initialEmbed = new EmbedBuilder()
		.setTitle(`Select which options should be included in the ${category} message.`)
		.setColor('Random');

	const component = new ActionRowBuilder().addComponents(
		new SelectMenuBuilder()
			.setCustomId(uuid)
			.setPlaceholder('Nothing selected.')
			.setMaxValues(options.length)
			.addOptions(options),
	) as ActionRowBuilder<SelectMenuBuilder>;

	await interaction.reply({ embeds: [initialEmbed], components: [component], ephemeral: true });

	const selectMenuInteraction = await interaction.channel?.awaitMessageComponent({
		time: 60 * 1000 * 5,
		componentType: ComponentType.StringSelect,
		filter: ({ customId, user }: SelectMenuInteraction) => customId === uuid && user.id === interaction.user.id,
	});
	if (!selectMenuInteraction) throw new Error('Channel assign timeout.');

	await Channels.assign(guild.id, channel, category, selectMenuInteraction.values);

	const finalEmbed = new EmbedBuilder()
		.setTitle(`${category} messages has been assigned to ${channel.name}.`)
		.setColor('Random');

	await selectMenuInteraction.update({ embeds: [finalEmbed], components: [] });

	if (category === 'Roles') await RolesJob.execute(selectMenuInteraction.client);
};

const dissociateChannel = async (interaction: ExtendedChatInputCommandInteraction) => {
	const channel = interaction.options.getChannel('channel', true) as GuildBasedChannel;
	const category = interaction.options.getString('category', true) as MessageCategory;

	if (channel.type !== ChannelType.GuildText) throw new Error('Channel must be a text channel.');

	if (category === 'Leaderboards') await dissociateChannelWithOptions(interaction, channel, category);
	else await dissociateChannelWithoutOptions(interaction, channel, category);
};

const dissociateChannelWithoutOptions = async (
	interaction: ExtendedChatInputCommandInteraction,
	channel: TextChannel,
	category: Extract<MessageCategory, 'Birthdays' | 'Roles'>,
) => {
	await Channels.dissociate(interaction.guild.id, channel, category, []);

	const embed = new EmbedBuilder()
		.setTitle(`${category} has been dissociated from ${channel.name}.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};

const dissociateChannelWithOptions = async (
	interaction: ExtendedChatInputCommandInteraction,
	channel: TextChannel,
	category: Extract<MessageCategory, 'Leaderboards'>,
) => {
	const options = getLeaderboardOptions();
	if (options.length === 0) throw new Error('Select at least one option from the menu.');

	const uuid = randomUUID();

	const component = new ActionRowBuilder().addComponents(
		new SelectMenuBuilder()
			.setCustomId(uuid)
			.setPlaceholder('Nothing selected.')
			.setMaxValues(options.length)
			.addOptions(options),
	) as ActionRowBuilder<SelectMenuBuilder>;

	const embed = new EmbedBuilder()
		.setTitle(`Select which options should be excluded from the ${category} message in channel ${channel.name}.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], components: [component], ephemeral: true });

	const selectMenuInteraction = await interaction.channel?.awaitMessageComponent({
		time: 60 * 1000 * 5,
		componentType: ComponentType.StringSelect,
		filter: ({ customId, user }: SelectMenuInteraction) => customId === uuid && user.id === interaction.user.id,
	});
	if (!selectMenuInteraction) throw new Error('Channel dissociate timeout.');

	await Channels.dissociate(interaction.guild.id, channel, category, selectMenuInteraction.values);

	const finalEmbed = new EmbedBuilder()
		.setTitle(`${category} message has been dissociated from ${channel.name}.`)
		.setColor('Random');

	await selectMenuInteraction.update({ embeds: [finalEmbed], components: [] });
};
