import { Bot } from '../bot';
import * as Reminders from '../services/reminders';
import { remindersModel } from '../database/models/reminders';
import { JobError } from '../errors/jobError';

export const data = {
    name: 'reminders',
    schedule: '*/10 * * * * *'
}

export const execute = async (client: Bot) => {
    const reminders = await remindersModel.find().sort({ timeEnd: 'asc' });
    if(reminders.length === 0) return;

    const { reminderId, timeEnd } = reminders[0];
    if(Date.now() < timeEnd) return;

    await Reminders.send(client, reminderId).catch(error => {
        throw new JobError(error.message);
    });
}