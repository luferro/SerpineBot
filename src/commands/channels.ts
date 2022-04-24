import { SlashCommandBuilder } from '@discordjs/builders';
import {
	CommandInteraction,
	Guild,
	MessageActionRow,
	MessageEmbed,
	MessageSelectMenu,
	SelectMenuInteraction,
	TextChannel,
	VoiceChannel,
} from 'discord.js';
import * as RolesJob from '../jobs/roles';
import * as Channels from '../services/channels';
import { ChannelCategories, MessageCategories } from '../types/categories';

export const data = {
	name: 'channels',
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName('channels')
		.setDescription('Channels related commands.')
		.setDefaultPermission(false)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Create a guild channel.')
				.addStringOption((option) => option.setName('name').setDescription('Channel name.').setRequired(true))
				.addStringOption((option) =>
					option
						.setName('type')
						.setDescription('Whether it should be a text or voice channel.')
						.setRequired(true)
						.addChoices(
							{ name: 'Text Channel', value: 'GUILD_TEXT' },
							{ name: 'Voice Channel', value: 'GUILD_VOICE' },
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
							{ name: 'Roles', value: 'GUILD_TEXT' },
							{ name: 'Leaderboards', value: 'LEADERBOARDS_MESSAGE' },
							{ name: 'Birthdays', value: 'BIRTHDAYS_MESSAGE' },
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
							{ name: 'Roles', value: 'GUILD_TEXT' },
							{ name: 'Leaderboards', value: 'LEADERBOARDS_MESSAGE' },
							{ name: 'Birthdays', value: 'BIRTHDAYS_MESSAGE' },
						),
				)
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('Text channel which has the bot message assigned.')
						.setRequired(true),
				),
		),
};

export const execute = async (interaction: CommandInteraction) => {
	const subcommand = interaction.options.getSubcommand();

	const select = async (category: string) => {
		const options: Record<string, (interaction: CommandInteraction) => Promise<void>> = {
			create: createChannel,
			update: updateChannel,
			delete: deleteChannel,
			assign: assignChannel,
			dissociate: dissociateChannel,
		};
		return options[category](interaction);
	};
	await select(subcommand);
};

const getRoleOptions = (guild: Guild) => {
	const roles = [...guild.roles.cache.values()].sort((a, b) => a.position - b.position);
	return roles
		.map(({ id, name, tags }) => {
			if (id === guild.roles.everyone.id || tags) return;

			return {
				label: name,
				value: id,
			};
		})
		.filter((option): option is NonNullable<typeof option> => !!option);
};

const getLeaderboardOptions = () => {
	const leaderboards = ['Steam'];
	return leaderboards.map((option) => ({ label: option, value: option }));
};

const createChannel = async (interaction: CommandInteraction) => {
	const name = interaction.options.getString('name')!;
	const type = interaction.options.getString('type')! as ChannelCategories;
	const topic = interaction.options.getString('topic') ?? '';
	const nsfw = interaction.options.getBoolean('nsfw') ?? false;

	const guild = interaction.guild as Guild;
	await Channels.create(guild, name, type, topic, nsfw);

	await interaction.reply({
		embeds: [new MessageEmbed().setTitle(`Channel ${name} has been created.`).setColor('RANDOM')],
		ephemeral: true,
	});
};

const updateChannel = async (interaction: CommandInteraction) => {
	const channel = interaction.options.getChannel('channel')!;
	const name = interaction.options.getString('name')!;
	const topic = interaction.options.getString('topic');
	const nsfw = interaction.options.getBoolean('nsfw');

	const isValid = channel instanceof TextChannel || channel instanceof VoiceChannel;
	if (!isValid)
		return await interaction.reply({ content: 'Channel must be a text or voice channel.', ephemeral: true });

	await Channels.update(channel, name, topic, nsfw);

	await interaction.reply({
		embeds: [new MessageEmbed().setTitle(`Channel ${channel.name} has been updated.`).setColor('RANDOM')],
		ephemeral: true,
	});
};

const deleteChannel = async (interaction: CommandInteraction) => {
	const channel = interaction.options.getChannel('channel');

	const isValid = channel instanceof TextChannel || channel instanceof VoiceChannel;
	if (!isValid)
		return await interaction.reply({ content: 'Channel must be a text or voice channel.', ephemeral: true });

	await Channels.remove(channel);

	await interaction.reply({
		embeds: [new MessageEmbed().setTitle(`Channel ${channel.name} has been deleted.`).setColor('RANDOM')],
		ephemeral: true,
	});
};

const assignChannel = async (interaction: CommandInteraction) => {
	const channel = interaction.options.getChannel('channel')!;
	const category = interaction.options.getString('category')! as MessageCategories;

	const isValid = channel instanceof TextChannel;
	if (!isValid) return await interaction.reply({ content: 'Channel must be a text channel.', ephemeral: true });

	const guild = interaction.guild as Guild;
	if (category === 'BIRTHDAYS_MESSAGE') {
		await Channels.assign(guild.id, channel, category, []);

		return await interaction.reply({
			embeds: [
				new MessageEmbed().setTitle(`${category} has been assigned to ${channel.name}.`).setColor('RANDOM'),
			],
			ephemeral: true,
		});
	}

	const options = category === 'ROLES_MESSAGE' ? getRoleOptions(guild) : getLeaderboardOptions();
	if (options.length === 0)
		return await interaction.reply({ content: `Invalid length of options for ${category}.`, ephemeral: true });

	const selectMenu = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId(`ASSIGN_${category}`)
			.setPlaceholder('Nothing selected.')
			.setMaxValues(options.length)
			.addOptions(options),
	);

	await interaction.reply({
		embeds: [
			new MessageEmbed()
				.setTitle(`Select which actions should be included in the ${category}.`)
				.setColor('RANDOM'),
		],
		components: [selectMenu],
		ephemeral: true,
	});

	const interactionChannel = interaction.channel as TextChannel;
	const filter = (filterInteraction: SelectMenuInteraction) =>
		filterInteraction.customId === `ASSIGN_${category}` && filterInteraction.user.id === interaction.user.id;

	const collector = interactionChannel.createMessageComponentCollector({
		filter,
		componentType: 'SELECT_MENU',
		max: 1,
		time: 60 * 1000 * 5,
	});
	await new Promise<void>((resolve, reject) => {
		collector.on('end', async (collected) => {
			try {
				const collectedInteraction = collected.first();
				if (!collectedInteraction) {
					await interaction.editReply({ content: 'Channel assign timeout.', embeds: [], components: [] });
					return;
				}

				await Channels.assign(guild.id, channel, category, collectedInteraction.values);

				collectedInteraction.update({
					embeds: [
						new MessageEmbed()
							.setTitle(`${category} has been assigned to ${channel.name}.`)
							.setColor('RANDOM'),
					],
					components: [],
				});

				if (category === 'ROLES_MESSAGE') await RolesJob.execute(collectedInteraction.client);
			} catch (error) {
				reject(error);
			}
		});
	});
};

const dissociateChannel = async (interaction: CommandInteraction) => {
	const channel = interaction.options.getChannel('channel')!;
	const category = interaction.options.getString('category')! as MessageCategories;

	const isValid = channel instanceof TextChannel;
	if (!isValid) return await interaction.reply({ content: 'Channel must be a text channel.', ephemeral: true });

	const guild = interaction.guild as Guild;
	if (category === 'ROLES_MESSAGE' || category === 'BIRTHDAYS_MESSAGE') {
		const result = await Channels.dissociate(guild.id, channel, category, []).catch((error: Error) => error);
		if (result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

		return await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setTitle(`${category} has been dissociated from ${channel.name}.`)
					.setColor('RANDOM'),
			],
			ephemeral: true,
		});
	}

	const options = getLeaderboardOptions();
	if (options.length === 0)
		return await interaction.reply({ content: `Invalid length of options for ${category}`, ephemeral: true });

	const selectMenu = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId(`DISSOCIATE_${category}`)
			.setPlaceholder('Nothing selected.')
			.setMaxValues(options.length)
			.addOptions(options),
	);

	await interaction.reply({
		embeds: [
			new MessageEmbed()
				.setTitle(`Select which actions should be excluded from the ${category} in channel ${channel.name}.`)
				.setColor('RANDOM'),
		],
		components: [selectMenu],
		ephemeral: true,
	});

	const interactionChannel = interaction.channel as TextChannel;
	const filter = (filterInteraction: SelectMenuInteraction) =>
		filterInteraction.customId === `DISSOCIATE_${category}` && filterInteraction.user.id === interaction.user.id;

	const collector = interactionChannel.createMessageComponentCollector({
		filter,
		componentType: 'SELECT_MENU',
		max: 1,
		time: 60 * 1000 * 5,
	});
	await new Promise<void>((resolve, reject) => {
		try {
			collector.on('end', async (collected) => {
				const collectedInteraction = collected.first();
				if (!collectedInteraction) {
					await interaction.editReply({ content: 'Channel dissociate timeout.', embeds: [], components: [] });
					return;
				}

				const result = await Channels.dissociate(
					guild.id,
					channel,
					category,
					collectedInteraction.values,
				).catch((error: Error) => error);
				if (result instanceof Error) {
					await interaction.editReply({ content: result.message, embeds: [], components: [] });
					return;
				}

				await collectedInteraction.update({
					embeds: [
						new MessageEmbed()
							.setTitle(`${category} has been dissociated from ${channel.name}.`)
							.setColor('RANDOM'),
					],
					components: [],
				});
			});

			resolve();
		} catch (error) {
			reject(error);
		}
	});
};
