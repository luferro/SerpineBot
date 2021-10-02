const mongoose = require('mongoose');

const steamSchema = mongoose.Schema({
    user: String,
    tag: String,
    type: String,
    profile: String,
    url: String,
    wishlist: {
        url: String,
        items: Array
    },
    recentlyPlayed: Array
});

module.exports = mongoose.model('steam', steamSchema, 'steam');