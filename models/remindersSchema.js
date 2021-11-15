import mongoose from 'mongoose';

const remindersSchema = mongoose.Schema({
    reminder: String, 
    user: String,
    timeStart: Number,
    timeEnd: Number,
    message: String
});

export default mongoose.model('reminders', remindersSchema);