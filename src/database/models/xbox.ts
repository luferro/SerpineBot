import mongoose, { Model } from 'mongoose';
import { Xbox } from '../../types/schemas';

const schema = new mongoose.Schema<Xbox>({
	userId: { type: String, required: true },
	profile: {
		gamertag: { type: String, required: true },
		gamerscore: { type: Number, required: true },
	},
});

export const xboxModel: Model<Xbox> = mongoose.model('xbox', schema, 'xbox');
