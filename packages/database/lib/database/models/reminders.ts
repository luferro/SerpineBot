import { randomUUID } from 'crypto';
import mongoose, { Model } from 'mongoose';

type Reminder = { reminderId: string; userId: string; timeStart: number; timeEnd: number; message: string };

interface RemindersModel extends Model<Reminder> {
	createReminder: (args: Omit<Reminder, 'reminderId'>) => Promise<string>;
	getReminders: () => Promise<Reminder[]>;
	deleteReminderById: (args: Pick<Reminder, 'reminderId'>) => Promise<void>;
}

const schema = new mongoose.Schema<Reminder>({
	reminderId: { type: String, required: true },
	userId: { type: String, required: true },
	timeStart: { type: Number, required: true },
	timeEnd: { type: Number, required: true, index: true },
	message: { type: String, required: true },
});

schema.statics.createReminder = async function ({ userId, timeStart, timeEnd, message }: Omit<Reminder, 'reminderId'>) {
	const reminderId = randomUUID();
	await this.create({ reminderId, userId, timeStart, timeEnd, message });
	return reminderId;
};

schema.statics.getReminders = async function () {
	return await this.find().sort({ timeEnd: 'asc' });
};

schema.statics.deleteReminderById = async function ({ reminderId }: Pick<Reminder, 'reminderId'>) {
	await this.deleteOne({ reminderId });
};

export default mongoose.model<Reminder, RemindersModel>('reminders', schema);
