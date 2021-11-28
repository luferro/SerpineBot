import cron from 'node-cron';

const schedule = (time, task) => {
    cron.schedule(time, () => task().catch(console.log), { timezone: 'Europe/Lisbon' });
}

export { schedule };