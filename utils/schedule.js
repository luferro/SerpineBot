const cron = require('node-cron');

module.exports = {
    schedule(time, task) {
        cron.schedule(time, () => task(), { timezone: 'Europe/Lisbon' });
    }
}