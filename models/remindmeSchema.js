const mongoose = require('mongoose');

const remindmeSchema = mongoose.Schema({
    userID: String,
    timeStart: Number,
    timeEnd: Number,
    message: String,
    saveMessage: Boolean
});

module.exports = mongoose.model('reminders', remindmeSchema);