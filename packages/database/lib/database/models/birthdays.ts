import mongoose, { Model } from 'mongoose';

type Birthday = { userId: string; date: Date };

interface BirthdaysModel extends Model<Birthday> {
	isBirthdayRegistered: (args: Pick<Birthday, 'userId'>) => Promise<boolean>;
	createBirthday: (args: Birthday) => Promise<void>;
	getAllBirthdays: () => Promise<Birthday[]>;
	getUpcomingBirthdays: () => Promise<Birthday[]>;
	getBirthdayById: (args: Pick<Birthday, 'userId'>) => Promise<Birthday>;
	deleteBirthdayById: (args: Pick<Birthday, 'userId'>) => Promise<void>;
}

const schema = new mongoose.Schema<Birthday>({
	userId: { type: String, required: true, index: true },
	date: { type: Date, required: true },
});

schema.statics.isBirthdayRegistered = async function ({ userId }: Pick<Birthday, 'userId'>) {
	const exists = await this.exists({ userId });
	return !!exists;
};

schema.statics.createBirthday = async function ({ userId, date }: Birthday) {
	date.setHours(0, 0, 0, 0);
	await this.create({ userId, date });
};

schema.statics.getAllBirthdays = async function () {
	return await this.find();
};

schema.statics.getUpcomingBirthdays = async function () {
	return await this.find({
		$expr: {
			$and: [
				{ $gte: [{ $dayOfMonth: '$date' }, new Date().getDate()] },
				{ $gte: [{ $month: '$date' }, new Date().getMonth() + 1] },
			],
		},
	});
};

schema.statics.getBirthdayById = async function ({ userId }: Pick<Birthday, 'userId'>) {
	return await this.find({ userId });
};

schema.statics.deleteBirthdayById = async function ({ userId }: Pick<Birthday, 'userId'>) {
	await this.deleteOne({ userId });
};

export default mongoose.model<Birthday, BirthdaysModel>('birthdays', schema);
