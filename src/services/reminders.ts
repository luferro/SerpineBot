import { MessageEmbed } from 'discord.js';
import { randomUUID } from 'crypto';
import { Bot } from '../bot';
import * as ConverterUtil from '../utils/converter';
import { remindersModel } from '../database/models/reminders';
import { TimeUnits } from '../types/categories';

export const create = async (userId: string, time: number, unit: TimeUnits, message: string) => {
    if(unit === 'seconds' && time < 300) throw new Error('Time has to be greater or equal than 300 seconds.');
    if(unit === 'minutes' && time < 5) throw new Error('Time has to be greater or equal than 5 minutes.');

    const ms = ConverterUtil.timeToMilliseconds(time, unit);

    const reminderId = randomUUID();
    const timeStart = Date.now();
    const timeEnd = Date.now() + ms;

    await new remindersModel({
        reminderId,
        userId,
        timeStart,
        timeEnd,
        message
    }).save();

    return {
        reminderId
    }
}

export const remove = async (reminderId: string) => {
    await remindersModel.deleteOne({ reminderId });
}

export const send = async (client: Bot, reminderId: string) => {
    const reminder = await remindersModel.findOne({ reminderId });
    const { userId, timeStart, message } = reminder!;

    const target = await client.users.fetch(userId);
    if(!target) throw new Error(`Couldn't find a target with userId ${userId}.`);

    await target.send({ embeds: [
        new MessageEmbed()
            .setTitle(`Reminder set on ${new Date(timeStart).toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })}`)
            .setDescription(`**Message**:\n${message.trim()}`)
            .setColor('RANDOM')
    ]});

    await remove(reminderId);
}