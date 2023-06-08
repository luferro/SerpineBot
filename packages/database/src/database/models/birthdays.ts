import mongoose, { Model } from 'mongoose';

type Birthday = { userId: string; date: string };

interface BirthdaysModel extends Model<Birthday> {
	isBirthdayRegistered: (args: Pick<Birthday, 'userId'>) => Promise<boolean>;
	createBirthday: (args: Birthday) => Promise<void>;
	getBirthdays: () => Promise<Birthday[]>;
	getBirthdayById: (args: Pick<Birthday, 'userId'>) => Promise<Birthday>;
	deleteBirthdayById: (args: Pick<Birthday, 'userId'>) => Promise<void>;
}

const schema = new mongoose.Schema<Birthday>({
	userId: { type: String, required: true, index: true },
	date: { type: String, required: true },
});

schema.statics.isBirthdayRegistered = async function ({ userId }: Pick<Birthday, 'userId'>) {
	const exists = await this.exists({ userId });
	return !!exists;
};

schema.statics.createBirthday = async function ({ userId, date }: Birthday) {
	await this.create({ userId, date });
};

schema.statics.getBirthdays = async function () {
	return await this.find();
};

schema.statics.getBirthdayById = async function ({ userId }: Pick<Birthday, 'userId'>) {
	return await this.find({ userId });
};

schema.statics.deleteBirthdayById = async function ({ userId }: Pick<Birthday, 'userId'>) {
	await this.deleteOne({ userId });
};

export default mongoose.model<Birthday, BirthdaysModel>('birthdays', schema);
