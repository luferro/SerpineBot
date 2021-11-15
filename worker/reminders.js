import { MessageEmbed } from 'discord.js';
import remindersSchema from '../models/remindersSchema.js';

const checkReminder = async client => {
    try {
        const reminders = await remindersSchema.find().sort({ timeEnd: 'asc' });
        if(reminders.length === 0) return;

        if(new Date().getTime() >= reminders[0].timeEnd) await sendReminder(client, reminders[0].user, reminders[0].reminder, reminders[0].timeStart, reminders[0].message);
    } catch (error) {
        console.log(`Job that triggered the error: checkReminder`);
        console.log(error);
    }
}

const sendReminder = async(client, userID, reminder, timeStart, message) => {
    const user = await client.users.fetch(userID);

    user.send({ embeds: [
        new MessageEmbed()
            .setTitle(`Reminder set on ${new Date(timeStart).toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })}`)
            .setDescription(`**Message**:\n${message.trim()}`)
            .setColor(Math.floor(Math.random() * 16777214) + 1)
    ]});

    await remindersSchema.deleteOne({ reminder });
}

export default { checkReminder };