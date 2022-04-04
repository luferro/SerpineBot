import { Bot } from '../bot';
import * as Birthdays from '../services/birthdays';
import { birthdaysModel } from '../database/models/birthdays';
import { settingsModel } from '../database/models/settings';
import { JobError } from '../errors/jobError';

export const data = {
    name: 'birthdays',
    schedule: '0 0 0 * * *'
}

export const execute = async (client: Bot) => {
    const errors: string[] = [];

    const birthdays = await birthdaysModel.find();
    for(const [guildId, guild] of client.guilds.cache) {
        for(const birthday of birthdays) {
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
    
            const { 1: month, 2: day } = birthday.date.split('-').map(Number);
            const birthdayDate = new Date(new Date().getFullYear(), month - 1, day);
            birthdayDate.setHours(0, 0, 0, 0);

            if(currentDate.getTime() !== birthdayDate.getTime()) continue;

            const settings = await settingsModel.findOne({ guildId });
            const channelId = settings?.birthdays.channelId;
            if(!channelId) continue;

            await Birthdays.send(guild, channelId, birthday.userId, birthday.date).catch(error => {
                errors.push(error.message);
            });
        }
    }

    if(errors.length > 0) throw new JobError(`Birthdays:\n${errors.join('\n')}`);
}