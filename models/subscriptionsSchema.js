import mongoose from 'mongoose';

const subscriptionsSchema = mongoose.Schema({
    subscription: String,
    items: Array,
    count: Number
}, { timestamps: true });

export default mongoose.model('subscriptions', subscriptionsSchema);