import cron from 'node-cron';

const schedule = (time, task) => {
    cron.schedule(time, () => task(), { timezone: 'Europe/Lisbon' });
}

export { schedule };