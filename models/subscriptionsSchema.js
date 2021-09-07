const mongoose = require('mongoose');

const subscriptionsSchema = mongoose.Schema({
    subscription: String,
    items: Array
});

module.exports = mongoose.model('subscriptions', subscriptionsSchema);