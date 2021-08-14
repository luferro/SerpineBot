const remindersSchema = require('../models/remindersSchema');
const crypto = require('crypto');

module.exports = {
	name: 'reminder',
    setupReminder(message, args) {
        if(args[1] === 'delete') this.deleteReminder(message, args[2]);
        else this.createReminder(message, args);
    },
	async createReminder(message, args) {
        const reminderID = crypto.randomUUID();
        const userID = message.author.id;
        const timeToRemind = message.content.match(/[0-9]+|(secs|mins|hours?|days?|weeks?|months?|years?)/g);
        const messageToRemind = args.slice(3).join(' ');

        if (!timeToRemind || !messageToRemind) return message.channel.send('Usage: ./reminder <time> <message>').then(m => { m.delete({ timeout: 5000 }) });

        let msToRemind;
        switch (timeToRemind[1]) {
            case 'secs':
                if(timeToRemind[0] < 300) return message.channel.send('Time has to be greater or equal than 300 seconds').then(m => { m.delete({ timeout: 5000 }) });
                msToRemind = timeToRemind[0] * 1000;
                break;
            case 'mins':
                if(timeToRemind[0] < 5) return message.channel.send('Time has to be greater or equal than 5 minutes').then(m => { m.delete({ timeout: 5000 }) });
                msToRemind = timeToRemind[0] * 1000 * 60;
                break;
            case 'hour':
            case 'hours':
                msToRemind = timeToRemind[0] * 1000 * 60 * 60;
                break;
            case 'day':
            case 'days':
                msToRemind = timeToRemind[0] * 1000 * 60 * 60 * 24;
                break;
            case 'week':
            case 'weeks':
                msToRemind = timeToRemind[0] * 1000 * 60 * 60 * 24 * 7;
                break;
            case 'month':
            case 'months':
                msToRemind = Math.ceil(timeToRemind[0] * 1000 * 60 * 60 * 24 * 30);
                break;
            case 'year':
            case 'years':
                msToRemind = Math.ceil(timeToRemind[0] * 1000 * 60 * 60 * 24 * 30 * 12);
                break;
            default:
                return message.channel.send('You need to define time as X secs | mins | hour(s) | day(s) | week(s) | month(s) | year(s) - e.g. ./reminder 5 mins <message>').then(m => { m.delete({ timeout: 5000 }) });
        }
        
        try {
            await new remindersSchema({
                reminder_id: reminderID,
                user: userID,
                timeStart: new Date().getTime(),
                timeEnd: new Date().getTime() + msToRemind,
                message: messageToRemind
            }).save();

            message.channel.send(`**Reminder ID:** ${reminderID}\n<@${userID}> I'll remind you about ${messageToRemind} in ${timeToRemind[0]} ${timeToRemind[1]}!`);
        } catch (error) {
            console.log(error);
        }   
    },
    async checkReminder(client) {
        try {
            const reminders = await remindersSchema.find().sort({ timeEnd: 'asc' });
            if(reminders.length === 0) return;

            if(new Date().getTime() >= reminders[0].timeEnd) await this.sendReminder(client, reminders[0]);
        } catch (error) {
            console.log(error);
        }
    },
    async sendReminder(client, reminder) {
        const msg = `
            **I was asked on ${new Date(reminder.timeStart).toUTCString().toUpperCase()} to remind you of the following message:**\n\n${reminder.message}
        `;

        client.users.fetch(reminder.user).then(user => {
            user.send(msg).then(m => { m.delete({ timeout: 1000*60*60*24 }) });
        });

        await remindersSchema.deleteOne({ reminder_id: reminder.reminder_id });
    },
    async deleteReminder(message, reminder_id) {
        try {
            if(!reminder_id) return message.channel.send('Usage: ./reminder delete <Reminder ID>').then(m => { m.delete({ timeout: 5000 }) });

            const deletedStatus = await remindersSchema.deleteOne({ reminder_id });

            message.channel.send(`Deleted ${deletedStatus.deletedCount} reminder!`);
        } catch (error) {
            console.log(error);
        }
    }
};
