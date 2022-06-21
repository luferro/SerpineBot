import mongoose, { Model } from 'mongoose';
import { Reminder } from '../../types/schemas';

const schema = new mongoose.Schema<Reminder>({
	reminderId: { type: String, required: true },
	userId: { type: String, required: true },
	timeStart: { type: Number, required: true },
	timeEnd: { type: Number, required: true },
	message: { type: String, required: true },
});

export const remindersModel: Model<Reminder> = mongoose.model('reminders', schema);
