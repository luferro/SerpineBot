const mongoose = require('mongoose');

const musicSchema = mongoose.Schema({
    guild: String,
    volume: String
});

module.exports = mongoose.model('music', musicSchema, 'music');