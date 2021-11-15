import remindersSchema from '../models/remindersSchema.js';
import { randomUUID } from 'crypto';
import { erase } from '../utils/message.js';

const setup = async(message, args) => {
    erase(message, 5000);

    if(args[1] === 'delete') return await deleteReminder(message, args[2]);
    await createReminder(message, args);
}

const createReminder = async(message, args) => {
    const reminderID = randomUUID();
    const user = message.author.id;
    const time = message.content.match(/[0-9]+|(secs|mins|hours?|days?|weeks?|months?|years?)/g);
    const text = args.slice(3).join(' ');

    if(!time || !text) return message.channel.send({ content: './cmd reminder' });
    if(time[1] === 'secs' && time[0] < 300) return message.channel.send({ content: 'Time has to be greater or equal than 300 seconds.' }).then(m => erase(m, 5000));
    if(time[1] === 'mins' && time[0] < 5) return message.channel.send({ content: 'Time has to be greater or equal than 5 minutes.' }).then(m => erase(m, 5000));

    const getMilliseconds = (type, time) => {
        const options = {
            'secs': time * 1000,
            'mins': time * 1000 * 60,
            'hour': time * 1000 * 60 * 60,
            'hours': time * 1000 * 60 * 60,
            'day': time * 1000 * 60 * 60 * 24,
            'days': time * 1000 * 60 * 60 * 24,
            'week': time * 1000 * 60 * 60 * 24 * 7,
            'weeks': time * 1000 * 60 * 60 * 24 * 7,
            'month': time * 1000 * 60 * 60 * 24 * 30,
            'months': time * 1000 * 60 * 60 * 24 * 30,
            'year': time * 1000 * 60 * 60 * 24 * 30 * 12,
            'years': time * 1000 * 60 * 60 * 24 * 30 * 12,
        };
        return options[type] || null;
    };

    const ms = getMilliseconds(time[1], time[0]);
    if(!ms) return message.channel.send({ content: 'You need to define time as X secs | mins | hour(s) | day(s) | week(s) | month(s) | year(s).' }).then(m => erase(m, 5000));

    await new remindersSchema({
        reminderID,
        user,
        timeStart: new Date().getTime(),
        timeEnd: new Date().getTime() + ms,
        message: text
    }).save();

    message.channel.send({ content: `**Reminder ID:** ${reminderID}\n<@${user}> I'll remind you about ${text} in ${time[0]} ${time[1]}!` });
}

const deleteReminder = async(message, reminderID) => {
    if(!reminderID) return message.channel.send({ content: './cmd reminder' });

    const status = await remindersSchema.deleteOne({ reminderID });

    message.channel.send({ content: `Deleted ${status.deletedCount} reminder!` });
}

export default { setup };