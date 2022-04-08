import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import * as Birthdays from '../services/birthdays';

export const data = {
    name: 'birthdays',
    client: false,
    slashCommand: new SlashCommandBuilder()
        .setName('birthdays')
        .setDescription('Birthday related commands.')
        .addSubcommand(subcommand => subcommand.setName('create').setDescription('Register your birthday.')
            .addIntegerOption(option => option.setName('day').setDescription('Day of your birthday.').setRequired(true))
            .addIntegerOption(option => option.setName('month').setDescription('Month of your birthday.').setRequired(true))
            .addIntegerOption(option => option.setName('year').setDescription('Year of your birthday.').setRequired(true))
        )
        .addSubcommand(subcommand => subcommand.setName('list').setDescription('Returns a list of birthdays.'))
        .addSubcommand(subcommand => subcommand.setName('delete').setDescription('Delete your birthday.'))
}

export const execute = async (interaction: CommandInteraction) => {
    const subcommand = interaction.options.getSubcommand();

    const select: Record<string, Function> = {
        'create': createBirthday,
        'list': getBirthdays,
        'delete': deleteBirthday
    }

    await select[subcommand](interaction);
}

const createBirthday = async (interaction: CommandInteraction) => {
    const day = interaction.options.getInteger('day')!;
    const month = interaction.options.getInteger('month')!;
    const year = interaction.options.getInteger('year')!;

    const date = `${year}-${month}-${day}`;

    const result = await Birthdays.create(interaction.user.id, date).catch((error: Error) => error);
    if(result instanceof Error) return await interaction.reply({ content: result.message, ephemeral: true });

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Your birthday has been registered.`)
			.setColor('RANDOM')
	], ephemeral: true });
}

const getBirthdays = async (interaction: CommandInteraction) => {
    const birthdays = await Birthdays.getBirthdays(interaction.client);
    if(birthdays.length === 0) return await interaction.reply({ content: 'No birthdays have been registered.', ephemeral: true });

    const formattedBirthday = birthdays.map(item => `${item.user.tag} **${item.birthday}**`);

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle('Birthdays')
            .setDescription(formattedBirthday.join('\n'))
			.setColor('RANDOM')
	]});
}

const deleteBirthday = async (interaction: CommandInteraction) => {
    await Birthdays.remove(interaction.user.id);

    await interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Your birthday has been deleted.`)
			.setColor('RANDOM')
	], ephemeral: true });
}