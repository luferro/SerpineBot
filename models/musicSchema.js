const mongoose = require('mongoose');

const musicSchema = mongoose.Schema({
    guildID: String,
    volume: String
});

module.exports = mongoose.model('musicSettings', musicSchema);