const remindersSchema = require('../models/remindersSchema');

module.exports = {
	name: 'reminders',
    async checkReminder(client) {
        try {
            const reminders = await remindersSchema.find().sort({ timeEnd: 'asc' });
            if(reminders.length === 0) return;

            if(new Date().getTime() >= reminders[0].timeEnd) this.sendReminder(client, reminders[0].user, reminders[0].reminder_id, reminders[0].timeStart, reminders[0].message);
        } catch (error) {
            console.log(error);
        }
    },
    async sendReminder(client, user_id, reminder_id, time_start, message) {
        try {
            const user = await client.users.fetch(user_id);
                
            user.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: `Reminder set on ${new Date(time_start).toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })}`,
                description: `**Message**:\n${message.trim()}`
            }});

            await remindersSchema.deleteOne({ reminder_id });   
        } catch (error) {
            console.log(error);
        }
    }
};
