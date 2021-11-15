import mongoose from 'mongoose';

const subscriptionsSchema = mongoose.Schema({
    subscription: String,
    items: Array
});

export default mongoose.model('subscriptions', subscriptionsSchema);