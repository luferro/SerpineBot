const remindersSchema = require('../models/remindersSchema');
const crypto = require('crypto');
const { erase } = require('../utils/message');

module.exports = {
	name: 'reminder',
    setup(message, args) {
        erase(message, 5000);

        if(args[1] === 'delete') this.deleteReminder(message, args[2]);
        else this.createReminder(message, args);
    },
	async createReminder(message, args) {
        const reminderID = crypto.randomUUID();
        const user = message.author.id;
        const time = message.content.match(/[0-9]+|(secs|mins|hours?|days?|weeks?|months?|years?)/g);
        const text = args.slice(3).join(' ');

        if (!time || !text) return message.channel.send('./cmd reminder');

        let ms;
        switch (time[1]) {
            case 'secs':
                if(time[0] < 300) return message.channel.send('Time has to be greater or equal than 300 seconds').then(m => { m.delete({ timeout: 5000 }) });
                ms = time[0] * 1000;
                break;
            case 'mins':
                if(time[0] < 5) return message.channel.send('Time has to be greater or equal than 5 minutes').then(m => { m.delete({ timeout: 5000 }) });
                ms = time[0] * 1000 * 60;
                break;
            case 'hour':
            case 'hours':
                ms = time[0] * 1000 * 60 * 60;
                break;
            case 'day':
            case 'days':
                ms = time[0] * 1000 * 60 * 60 * 24;
                break;
            case 'week':
            case 'weeks':
                ms = time[0] * 1000 * 60 * 60 * 24 * 7;
                break;
            case 'month':
            case 'months':
                ms = Math.ceil(time[0] * 1000 * 60 * 60 * 24 * 30);
                break;
            case 'year':
            case 'years':
                ms = Math.ceil(time[0] * 1000 * 60 * 60 * 24 * 30 * 12);
                break;
            default:
                return message.channel.send('You need to define time as X secs | mins | hour(s) | day(s) | week(s) | month(s) | year(s) - e.g. ./reminder 5 mins <message>').then(m => { m.delete({ timeout: 5000 }) });
        }
        
        try {
            await new remindersSchema({
                reminderID,
                user,
                timeStart: new Date().getTime(),
                timeEnd: new Date().getTime() + ms,
                message: text
            }).save();

            message.channel.send(`**Reminder ID:** ${reminderID}\n<@${user}> I'll remind you about ${text} in ${time[0]} ${time[1]}!`);
        } catch (error) {
            console.log(error);
        }   
    },
    async deleteReminder(message, reminderID) {
        try {
            if(!reminderID) return message.channel.send('./cmd reminder');

            const status = await remindersSchema.deleteOne({ reminderID });

            message.channel.send(`Deleted ${status.deletedCount} reminder!`);
        } catch (error) {
            console.log(error);
        }
    }
};
