import mongoose from 'mongoose';

const musicSchema = mongoose.Schema({
    guild: String,
    volume: String
});

export default mongoose.model('music', musicSchema, 'music');