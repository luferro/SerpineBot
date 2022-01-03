import { MessageEmbed } from 'discord.js';
import remindersSchema from '../models/remindersSchema.js';

const checkReminder = async client => {
    const reminders = await remindersSchema.find().sort({ timeEnd: 'asc' });
    if(reminders.length === 0) return;

    if(new Date().getTime() >= reminders[0].timeEnd) await sendReminder(client, reminders[0].user, reminders[0].reminder, reminders[0].timeStart, reminders[0].message);
}

const sendReminder = async (client, user, reminder, timeStart, message) => {
    const target = await client.users.fetch(user);

    target.send({ embeds: [
        new MessageEmbed()
            .setTitle(`Reminder set on ${new Date(timeStart).toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })}`)
            .setDescription(`**Message**:\n${message.trim()}`)
            .setColor('RANDOM')
    ]});

    await remindersSchema.deleteOne({ reminder });
}

export default { checkReminder };