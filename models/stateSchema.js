import mongoose from 'mongoose';

const stateSchema = mongoose.Schema({
    category: String,
    entries: Array
}, { timestamps: true });

export default mongoose.model('state', stateSchema, 'state');