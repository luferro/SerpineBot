const mongoose = require('mongoose');

const wishlistsSchema = mongoose.Schema({
    user: String,
    tag: String,
    list: String,
    items: Array
});

module.exports = mongoose.model('wishlists', wishlistsSchema);