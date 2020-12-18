const remindmeSchema = require('../models/remindmeSchema');

module.exports = {
	name: 'remindme',
	async execute(message) {
        const userID = message.author.id;
        const timeToRemind = message.content.match(/[0-9]+|(secs|mins|hours|days|weeks|months|years)/g);
        const messageToRemind = message.content.match(/\"(.*?)\"/g);
        const saveReminder = message.content.includes('-save');

        if (!timeToRemind || !messageToRemind) return message.channel.send('Usage: ./remindme <time> "<message>" <optional: -save>').then((m) => {m.delete({ timeout: 5000 });});

        let msToRemind;
        switch (timeToRemind[1]) {
            case 'secs':
                if(timeToRemind[0] < 300) return message.channel.send('Time has to be greater or equal than 300 seconds').then((m) => {m.delete({ timeout: 5000 });});
                msToRemind = timeToRemind[0] * 1000;
                break;
            case 'mins':
                if(timeToRemind[0] < 5) return message.channel.send('Time has to be greater or equal than 5 minutes').then((m) => {m.delete({ timeout: 5000 });});
                msToRemind = timeToRemind[0] * 1000 * 60;
                break;
            case 'hours':
                msToRemind = timeToRemind[0] * 1000 * 60 * 60;
                break;
            case 'days':
                msToRemind = timeToRemind[0] * 1000 * 60 * 60 * 24;
                break;
            case 'weeks':
                msToRemind = timeToRemind[0] * 1000 * 60 * 60 * 24 * 7;
                break;
            case 'months':
                msToRemind = Math.ceil(timeToRemind[0] * 1000 * 60 * 60 * 24 * 30);
                break;
            case 'years':
                msToRemind = Math.ceil(timeToRemind[0] * 1000 * 60 * 60 * 24 * 30 * 12);
                break;
            default:
                return message.channel.send('You need to define time as X secs | mins | hours | days | weeks | months | years - e.g. ./remindme 5 mins "<message>" <optional: -save>').then((m) => {m.delete({ timeout: 5000 });});
        }
        
        try {
            const reminder = {
                userID: userID,
                timeStart: new Date().getTime(),
                timeEnd: new Date().getTime() + msToRemind,
                message: messageToRemind[0] ,
                saveMessage: saveReminder
            }

            await new remindmeSchema(reminder).save();

            message.channel.send(`A reminder has been set for <@${userID}>!`);
        } catch (error) {
            console.log(error);
        }   
    },
    async sendReminder(client) {
        try {
            if(await remindmeSchema.estimatedDocumentCount() > 0) {
                const reminder = await remindmeSchema.findOne().sort({timeEnd: 'asc'});

                if(new Date().getTime() >= reminder.timeEnd) {
                    const msg = `
                        **I HAVE BEEN ASKED ON ${new Date(reminder.timeStart).toUTCString().toUpperCase()} TO REMIND YOU OF THIS**
                        \n${reminder.message}
                    `;

                    client.users.fetch(reminder.userID).then(user => {
                        user.send(msg).then((m) => {!reminder.saveMessage && m.delete({ timeout: 1000*60*60 });});
                    }); 

                    await remindmeSchema.findByIdAndDelete({_id: reminder._id});
                }
            }
            else return;
        } catch (error) {
            console.log(error);
        }
    }
};
