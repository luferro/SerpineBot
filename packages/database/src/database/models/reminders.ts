import { randomUUID } from 'crypto';
import mongoose, { Model } from 'mongoose';

import type { Reminder } from '../../types/schemas';

interface RemindersModel extends Model<Reminder> {
	createReminder: (userId: string, timeStart: number, timeEnd: number, message: string) => Promise<string>;
	getReminders: () => Promise<Reminder[]>;
	deleteReminderById: (reminderId: string) => Promise<string>;
}

const schema = new mongoose.Schema<Reminder>({
	reminderId: { type: String, required: true },
	userId: { type: String, required: true },
	timeStart: { type: Number, required: true },
	timeEnd: { type: Number, required: true },
	message: { type: String, required: true },
});

schema.statics.createReminder = async function (userId: string, timeStart: number, timeEnd: number, message: string) {
	const reminderId = randomUUID();
	await this.create({ reminderId, userId, timeStart, timeEnd, message });
	return reminderId;
};

schema.statics.getReminders = async function () {
	return await this.find().sort({ timeEnd: 'asc' });
};

schema.statics.deleteReminderById = async function (reminderId: string) {
	await this.deleteOne({ reminderId });
};

export default mongoose.model<Reminder, RemindersModel>('reminders', schema);
