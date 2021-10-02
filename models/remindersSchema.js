const mongoose = require('mongoose');

const remindersSchema = mongoose.Schema({
    reminderID: String, 
    user: String,
    timeStart: Number,
    timeEnd: Number,
    message: String
});

module.exports = mongoose.model('reminders', remindersSchema);