import mongoose from 'mongoose';

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

export default mongoose.model('steam', steamSchema, 'steam');