import { EmbedBuilder, GuildMember, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.gaming.xbox.profile.name'))
	.setDescription(t('interactions.gaming.xbox.profile.description'))
	.addMentionableOption((option) =>
		option
			.setName(t('interactions.gaming.xbox.profile.options.0.name'))
			.setDescription(t('interactions.gaming.xbox.profile.options.0.description')),
	);

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();
	const mention = interaction.options.getMentionable(data.options[0].name) as GuildMember | null;

	const integration = await client.prisma.xbox.findUnique({
		where: { userId: mention?.user.id ?? interaction.user.id },
	});
	if (!integration) throw new Error(t('errors.unprocessable'));

	const { name, image, gamerscore, gamesPlayed } = await client.api.gaming.platforms.xbox.getProfile({
		gamertag: integration.profile.gamertag,
	});

	const embed = new EmbedBuilder()
		.setTitle(name)
		.setThumbnail(image)
		.addFields([
			{
				name: t('interactions.gaming.xbox.profile.embed.fields.0.name'),
				value: gamerscore.toString(),
			},
			{
				name: t('interactions.gaming.xbox.profile.embed.fields.1.name'),
				value: gamesPlayed.toString(),
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
