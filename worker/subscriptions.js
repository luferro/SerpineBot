const puppeteer = require('puppeteer');
const subscriptionsSchema = require('../models/subscriptionsSchema');
const { slug } = require('../utils/slug');

module.exports = {
    name: 'subscriptions',
    async getSubscriptions() {
        let browser, page;
        try {
            browser = await puppeteer.launch({ args: ['--no-sandbox'] });
            page = await browser.newPage();

            console.log('Fetching subscriptions...');
            await this.getXboxGamePass(page, 'xbox');
            await this.getXboxGamePass(page, 'pc');
            await this.getUbisoftPlus(page);
            await this.getEAPlay(page, 'base');
            await this.getEAPlay(page, 'premium');
        } catch (error) {
            console.log(error);
        } finally {
            console.log('Finished...');
            await page.close();
            await browser.close();
        }
    },
    async getXboxGamePass(page, type) { 
        const getType = (type) => {
            const options = {
                'pc': 'PC',
                'xbox': 'Console'
            }
            return options[type] || null;
        }
        const platform = getType(type);
        if(!platform) return;
        try {
            await page.goto('https://www.xbox.com/pt-PT/xbox-game-pass/games', { waitUntil: 'networkidle0', timeout: 0 });
            await page.waitForTimeout(1000);
            await page.waitForSelector(`[data-theplat="${type}"]`);
            await page.click(`[data-theplat="${type}"]`);

            const selectedPlatform = await page.evaluate(() => document.querySelector('[data-platselected]').getAttribute('data-platselected'));
            if(platform === 'PC' && selectedPlatform === 'xbox') return;
            
            const items = [];
            let hasMore = true;
            while(hasMore) {
                await page.waitForSelector('.gameList [itemtype="http://schema.org/Product"]');

                const data = await page.$$eval('.gameList [itemtype="http://schema.org/Product"]', elements =>
                    elements.map(item => ({ name: item.querySelector('h3').textContent, url: item.querySelector('a').href }))
                );

                items.push(...data.map(item => ({ name: item.name, slug: slug(item.name), url: item.url })));

                await page.waitForTimeout(1000);
                hasMore = (await page.$$('.paginatenext:not(.pag-disabled) a')).length > 0;
                if(hasMore) await page.click('.paginatenext:not(.pag-disabled) a');
            }

            console.log(`Xbox Gamepass ${platform} - Found ${items.length} entries...`);

            const storedSubscription = await subscriptionsSchema.find({ subscription: `Xbox Game Pass for ${platform}` });
            if(items.length < Math.round(storedSubscription[0].items.length * 0.6)) return;

            await subscriptionsSchema.updateOne({ subscription: `Xbox Game Pass for ${platform}` }, { $set: { items } }, { upsert: true });
        } catch (error) {
            console.log(error);
        }
    },
    async getUbisoftPlus(page) { 
        try {
            await page.goto('https://store.ubi.com/eu/ubisoftplus/games', { waitUntil: 'networkidle0', timeout: 0 });
            await page.waitForTimeout(1000);
            const cookies = (await page.$$('button#privacy__modal__accept')).length > 0;
            cookies && await page.click('button#privacy__modal__accept');
            const region = (await page.$$('button.stay-on-country-store')).length > 0;
            region && await page.click('button.stay-on-country-store');
            
            let hasMore = true;
            while(hasMore) {
                await page.waitForTimeout(1000);
                hasMore = (await page.$$('main > :last-child > :last-child > :nth-child(4) > button')).length > 0;
                if(hasMore) await page.click('main > :last-child > :last-child > :nth-child(4) > button');
            }

            const data = await page.$$eval('.game-list_inner > div', (elements) =>
                elements.map(item => ({ name: item.querySelector('h3.game-short-title').textContent || item.querySelector('h3.game-long-title').textContent }))
            );

            const items = [];
            items.push(...data.map(item => ({ name: item.name, slug: slug(item.name) })));

            console.log(`Ubisoft+ - Found ${items.length} entries...`);

            const storedSubscription = await subscriptionsSchema.find({ subscription: 'Ubisoft+ for PC' });
            if(items.length < Math.round(storedSubscription[0].items.length * 0.6)) return;

            await subscriptionsSchema.updateOne({ subscription: 'Ubisoft+ for PC' }, { $set: { items } }, { upsert: true });
        } catch (error) {
            console.log(error);
        }
    },
    async getEAPlay(page, type) {
        const getType = (type) => {
            const options = {
                'base': 'vault-games',
                'premium': 'premium-vault-games'
            }
            return options[type] || null;
        }
        const subscriptionType = getType(type);
        if(!subscriptionType) return;
        try {
            await page.goto(`https://www.origin.com/irl/en-us/store/browse?fq=subscriptionGroup:${subscriptionType}`, { waitUntil: 'networkidle0', timeout: 0 });
            await page.waitForTimeout(1000);
            await page.evaluate(async() => {
                await new Promise(resolve => {
                    let totalHeight = 0;
                    let distance = 100;
                    const timer = setInterval(() => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
        
                        if(totalHeight >= scrollHeight){
                            clearInterval(timer);
                            resolve();
                        }
                    }, 200);
                });
            });
            await page.waitForTimeout(1000);

            const data = await page.$$eval('section.origin-gdp-tilelist > ul li[origin-postrepeat]', (elements) =>
                elements.map(item => ({ name: item.querySelector('h1.home-tile-header').textContent, url: item.querySelector('a').href }))
            );

            const items = [];
            items.push(...data.map(item => ({ name: item.name, slug: slug(item.name), url: item.url })));

            const subscription = type === 'premium' ? 'EA Play Pro' : 'EA Play';
            console.log(`${subscription} - Found ${items.length} entries...`);

            const storedSubscription = await subscriptionsSchema.find({ subscription });
            if(items.length < Math.round(storedSubscription[0].items.length * 0.6)) return;

            await subscriptionsSchema.updateOne({ subscription }, { $set: { items } }, { upsert: true });
        } catch (error) {
            console.log(error);
        }
    }
}