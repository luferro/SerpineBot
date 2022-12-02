import type { CommandData } from '../types/bot';
import type { ExtendedChatInputCommandInteraction } from '../types/interaction';
import type { GuildMember } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { SteamApi } from '@luferro/games-api';
import * as Leaderboards from '../services/leaderboards';
import { steamModel } from '../database/models/steam';
import { CommandName } from '../types/enums';

export const data: CommandData = {
	name: CommandName.Steam,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Steam)
		.setDescription('Steam related commands.')
		.addSubcommand((subcommand) => subcommand.setName('sale').setDescription('Next steam sales.'))
		.addSubcommand((subcommand) => subcommand.setName('top').setDescription("Steam's top played games."))
		.addSubcommand((subcommand) => subcommand.setName('hot').setDescription("Steam's top sellers."))
		.addSubcommand((subcommand) => subcommand.setName('new').setDescription("Steam's upcoming games."))
		.addSubcommand((subcommand) =>
			subcommand.setName('leaderboard').setDescription('Steam leaderboard for the current week.'),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('profile')
				.setDescription('Steam profile for your account/mentioned user.')
				.addMentionableOption((option) => option.setName('mention').setDescription('User mention.')),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('wishlist')
				.setDescription('Steam wishlist for your account/mentioned user.')
				.addMentionableOption((option) => option.setName('mention').setDescription('User mention.')),
		),
};

export const execute = async (interaction: ExtendedChatInputCommandInteraction) => {
	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (arg0: typeof interaction) => Promise<void>> = {
		new: getUpcoming,
		top: getTopPlayed,
		hot: getTopSellers,
		sale: getNextSale,
		profile: getProfile,
		wishlist: getWishlist,
		leaderboard: getLeaderboard,
	};

	await select[subcommand](interaction);
};

const getNextSale = async (interaction: ExtendedChatInputCommandInteraction) => {
	const { sale, status, upcoming } = await SteamApi.getNextSale();
	if (!sale) throw new Error('No dates were found for the next steam sale.');

	const embed = new EmbedBuilder()
		.setTitle('When is the next Steam sale?')
		.setDescription(`*${status || ''}*\n**${sale}**`)
		.addFields([
			{
				name: '**Upcoming Sales**',
				value: upcoming.join('\n') || 'N/A',
			},
		])
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const getTopPlayed = async (interaction: ExtendedChatInputCommandInteraction) => {
	const topPlayed = await SteamApi.getTopPlayed();
	if (topPlayed.length === 0) throw new Error("No games were found in Steam's top played list.");

	const embed = new EmbedBuilder()
		.setTitle("Steam's Top Played")
		.setDescription(topPlayed.join('\n'))
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const getTopSellers = async (interaction: ExtendedChatInputCommandInteraction) => {
	const topSellers = await SteamApi.getTopSellers();
	if (topSellers.length === 0) throw new Error("No games were found in Steam's top sellers list.");

	const embed = new EmbedBuilder()
		.setTitle("Steam's Top Sellers")
		.setDescription(topSellers.join('\n'))
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const getUpcoming = async (interaction: ExtendedChatInputCommandInteraction) => {
	const upcoming = await SteamApi.getUpcoming();
	if (upcoming.length === 0) throw new Error("No games were found in Steam's upcoming list.");

	const embed = new EmbedBuilder()
		.setTitle("Steam's Upcoming Games")
		.setDescription(upcoming.join('\n'))
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const getLeaderboard = async (interaction: ExtendedChatInputCommandInteraction) => {
	const leaderboard = await Leaderboards.getSteamLeaderboard(interaction.client);
	if (leaderboard.length === 0) throw new Error('No Steam leaderboard is available.');

	const embed = new EmbedBuilder()
		.setTitle('Weekly Steam Leaderboard')
		.setDescription(leaderboard.join('\n'))
		.setFooter({ text: 'Leaderboard resets every sunday at 00:00 UTC.' })
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const getProfile = async (interaction: ExtendedChatInputCommandInteraction) => {
	const mention = interaction.options.getMentionable('mention') as GuildMember | null;
	const userId = mention?.user.id ?? interaction.user.id;

	const integration = await steamModel.findOne({ userId });
	if (!integration) throw new Error('No Steam integration is in place.');

	const { name, image, status, logoutAt, createdAt } = await SteamApi.getProfile(integration.profile.id);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setURL(integration.profile.url)
		.setThumbnail(image)
		.addFields([
			{
				name: '**SteamId64**',
				value: integration.profile.id,
			},
			{
				name: '**Status**',
				value: status,
			},
			{
				name: '**Created at**',
				value: createdAt,
				inline: true,
			},
			{
				name: '**Last logout at**',
				value: logoutAt,
				inline: true,
			},
		])
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const getWishlist = async (interaction: ExtendedChatInputCommandInteraction) => {
	const mention = interaction.options.getMentionable('mention') as GuildMember | null;
	const user = mention?.user ?? interaction.user;

	const integration = await steamModel.findOne({ userId: user.id });
	if (!integration) throw new Error('No Steam integration is in place.');

	const formattedWishlist = integration.wishlist
		.slice(0, 10)
		.map(
			({ name, url, discounted, free }, index) =>
				`\`${index + 1}.\` **[${name}](${url})** | ${discounted || (free && 'Free') || 'N/A'}`,
		);
	const hasMoreItems = integration.wishlist.length - formattedWishlist.length > 0;
	if (hasMoreItems) formattedWishlist.push(`And ${integration.wishlist.length - formattedWishlist.length} more!`);

	const embed = new EmbedBuilder()
		.setTitle(`\`${user.tag}\`'s wishlist`)
		.setURL(`https://store.steampowered.com/wishlist/profiles/${integration.profile.id}/#sort=order`)
		.setDescription(formattedWishlist.join('\n'))
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};
