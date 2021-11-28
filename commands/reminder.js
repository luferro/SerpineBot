import { MessageEmbed } from 'discord.js';
import { randomUUID } from 'crypto';
import remindersSchema from '../models/remindersSchema.js';

const setup = async interaction => {
    const subcommand = interaction.options.getSubcommand();

    const getCommand = type => {
        const options = {
            'create': async() => await createReminder(),
            'delete': async() => await deleteReminder()
        }
        return options[type]();
    }
    await getCommand(subcommand);
}

const createReminder = async interaction => {
    const user = interaction.user.id;
    const time = interaction.options.getInteger('time');
    const unit = interaction.options.getString('unit');
    const message = interaction.options.getString('message');

    if(unit === 'secs' && time < 300) return interaction.reply({ content: 'Time has to be greater or equal than 300 seconds.', ephemeral: true });
    if(unit === 'mins' && time < 5) return message.channel.send({ content: 'Time has to be greater or equal than 5 minutes.', ephemeral: true });

    const getMilliseconds = (type, time) => {
        const options = {
            'secs': time * 1000,
            'mins': time * 1000 * 60,
            'hours': time * 1000 * 60 * 60,
            'days': time * 1000 * 60 * 60 * 24,
            'weeks': time * 1000 * 60 * 60 * 24 * 7,
            'months': time * 1000 * 60 * 60 * 24 * 30,
            'years': time * 1000 * 60 * 60 * 24 * 30 * 12,
        };
        return options[type];
    };

    const ms = getMilliseconds(unit, time);
    const reminder = randomUUID();
    const timeStart = new Date().getTime();
    const timeEnd = new Date().getTime() + ms;

    await new remindersSchema({ reminder, user, timeStart, timeEnd, message }).save();

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`**Reminder ID:** ${reminder}`)
            .setDescription(`<@${user}>, I'll remind you about **${message}** in *${time} ${unit}*!`)
            .setColor('RANDOM')
    ], ephemeral: true });
}

const deleteReminder = async interaction => {
    const reminder = interaction.options.getString('reminder');

    const status = await remindersSchema.deleteOne({ reminder });
    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`Deleted ${status.deletedCount} reminder!`)
            .setColor('RANDOM')
    ], ephemeral: true });
}

export default { setup };