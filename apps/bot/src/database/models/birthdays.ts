import mongoose, { Model } from 'mongoose';
import type { Birthday } from '../../types/schemas';

const schema = new mongoose.Schema<Birthday>({
	userId: { type: String, required: true },
	date: { type: String, required: true },
});

export const birthdaysModel: Model<Birthday> = mongoose.model('birthdays', schema);
