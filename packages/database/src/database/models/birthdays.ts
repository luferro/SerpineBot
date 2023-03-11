import mongoose, { Model } from 'mongoose';

import type { Birthday } from '../../types/schemas';

interface BirthdaysModel extends Model<Birthday> {
	createOrUpdateBirthday: (userId: string, date: string) => Promise<void>;
	getBirthdays: () => Promise<Birthday[]>;
	deleteBirthdayById: (userId: string) => Promise<void>;
}

const schema = new mongoose.Schema<Birthday>({
	userId: { type: String, required: true },
	date: { type: String, required: true },
});

schema.statics.createOrUpdateBirthday = async function (userId: string, date: string) {
	await this.updateOne({ userId }, { $set: { date } }, { upsert: true });
};

schema.statics.getBirthdays = async function () {
	return await this.find();
};

schema.statics.deleteBirthdayById = async function (userId: string) {
	return await this.deleteOne({ userId });
};

export default mongoose.model<Birthday, BirthdaysModel>('birthdays', schema);
