import mongoose from 'mongoose';

const settingsSchema = mongoose.Schema({
    guild: String,
    music: {
        volume: String
    },
    roles: {
        channel: String,
        options: Array
    },
    leaderboards: {
        steam: {
            channel: String,
        }
    },
    webhooks: Array
});

export default mongoose.model('settings', settingsSchema);