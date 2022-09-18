import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { XboxApi } from '@luferro/games-api';
import * as Leaderboards from '../services/leaderboards';
import { CommandName } from '../types/enums';
import { xboxModel } from '../database/models/xbox';

export const data = {
	name: CommandName.Xbox,
	isClientRequired: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Xbox)
		.setDescription('Xbox related commands.')
		.addSubcommand((subcommand) => subcommand.setName('top').setDescription("Xbox's top played games."))
		.addSubcommand((subcommand) => subcommand.setName('hot').setDescription("Xbox's top sellers."))
		.addSubcommand((subcommand) => subcommand.setName('new').setDescription("Xbox's upcoming games."))
		.addSubcommand((subcommand) =>
			subcommand.setName('leaderboard').setDescription('Xbox leaderboard for the current week.'),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('profile')
				.setDescription('Xbox profile for your account/mentioned user.')
				.addMentionableOption((option) => option.setName('mention').setDescription('User mention.')),
		),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const subcommand = interaction.options.getSubcommand();

	const select: Record<string, (arg0: ChatInputCommandInteraction) => Promise<void>> = {
		new: getUpcoming,
		top: getTopPlayed,
		hot: getTopSellers,
		profile: getProfile,
		leaderboard: getLeaderboard,
	};

	await select[subcommand](interaction);
};

const getTopPlayed = async (interaction: ChatInputCommandInteraction) => {
	const topPlayed = await XboxApi.getTopPlayed();
	if (topPlayed.length === 0) throw new Error("No games were found in Xbox's top played list.");

	const embed = new EmbedBuilder()
		.setTitle("Xbox's Top Played")
		.setDescription(topPlayed.join('\n'))
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const getTopSellers = async (interaction: ChatInputCommandInteraction) => {
	const topSellers = await XboxApi.getTopSellers();
	if (topSellers.length === 0) throw new Error("No games were found in Xbox's top sellers list.");

	const embed = new EmbedBuilder()
		.setTitle("Xbox's Top Sellers")
		.setDescription(topSellers.join('\n'))
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const getUpcoming = async (interaction: ChatInputCommandInteraction) => {
	const upcoming = await XboxApi.getUpcoming();
	if (upcoming.length === 0) throw new Error("No games were found in Xbox's upcoming list.");

	const embed = new EmbedBuilder()
		.setTitle("Xbox's Upcoming Games")
		.setDescription(upcoming.join('\n'))
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const getLeaderboard = async (interaction: ChatInputCommandInteraction) => {
	const leaderboard = await Leaderboards.getXboxLeaderboard(interaction.client);
	if (leaderboard.length === 0) throw new Error('No Xbox leaderboard is available.');

	const embed = new EmbedBuilder()
		.setTitle('Weekly Xbox Leaderboard')
		.setDescription(leaderboard.join('\n'))
		.setFooter({ text: 'Leaderboard resets every sunday at 00:00 UTC.' })
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};

const getProfile = async (interaction: ChatInputCommandInteraction) => {
	const mention = interaction.options.getMentionable('mention') as GuildMember | null;
	const userId = mention?.user.id ?? interaction.user.id;

	const integration = await xboxModel.findOne({ userId });
	if (!integration) throw new Error('No Xbox integration is in place.');

	const { name, image, gamerscore, gamesPlayed } = await XboxApi.getProfile(integration.profile.gamertag);

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setThumbnail(image)
		.addFields([
			{
				name: '**Gamerscore**',
				value: gamerscore.toString(),
			},
			{
				name: '**Games played**',
				value: gamesPlayed.toString(),
			},
		])
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};
