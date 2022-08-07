import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as Subscriptions from '../services/subscriptions';
import * as StringUtil from '../utils/string';
import { CommandName, SubscriptionCategory } from '../types/enums';

export const data = {
	name: CommandName.Subscriptions,
	client: false,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Subscriptions)
		.setDescription('Subscription services related commands.')
		.addIntegerOption((option) =>
			option
				.setName('category')
				.setDescription('Subscription service category.')
				.setRequired(true)
				.addChoices(
					{ name: 'Gaming', value: SubscriptionCategory.Gaming },
					{ name: 'Series', value: SubscriptionCategory.Series },
					{ name: 'Movies', value: SubscriptionCategory.Movies },
				),
		)
		.addStringOption((option) => option.setName('item').setDescription('Item title').setRequired(true)),
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const category = interaction.options.getInteger('category', true) as SubscriptionCategory;
	const item = interaction.options.getString('item', true);

	const subscriptions =
		category === SubscriptionCategory.Gaming
			? await Subscriptions.getGamingSubscriptions(item)
			: await Subscriptions.getStreamingSubscriptions(item, category);
	if (!subscriptions || subscriptions.length === 0) throw new Error(`No subscription service includes ${item}.`);

	const formattedSubscriptions = subscriptions
		.map(({ name, entry }) => (entry.url ? `**[${name}](${entry.url})**` : `**${name}**`))
		.join('\n');

	const embed = new EmbedBuilder()
		.setTitle(StringUtil.truncate(subscriptions[0].entry.name))
		.addFields([
			{
				name: `Available in **${subscriptions.length}** subscription(s)`,
				value: formattedSubscriptions,
			},
		])
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};
