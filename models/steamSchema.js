import mongoose from 'mongoose';

const steamSchema = mongoose.Schema({
    user: String,
    profile: {
        url: String
    },
    wishlist: {
        url: String,
        items: Array
    },
    recentlyPlayed: Array,
    notifications: Boolean
});

export default mongoose.model('steam', steamSchema, 'steam');