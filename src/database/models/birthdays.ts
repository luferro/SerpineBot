import mongoose from 'mongoose';
import { Birthday } from '../../types/schemas';

const schema = new mongoose.Schema<Birthday>({
	userId: { type: String, required: true },
	date: { type: String, required: true },
});

export const birthdaysModel = mongoose.model('birthdays', schema);
