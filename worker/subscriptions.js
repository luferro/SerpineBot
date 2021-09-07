const puppeteer = require('puppeteer');
const subscriptionsSchema = require('../models/subscriptionsSchema');
const { slug } = require('../utils/slug');

module.exports = {
    name: 'subscriptions',
    async getSubscriptions() {
        try {
            const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

            await this.getXboxGamePass(browser, 'xbox');
            await this.getXboxGamePass(browser, 'pc');
            await this.getUbisoftPlus(browser);
            await this.getEAPlay(browser, 'base');
            await this.getEAPlay(browser, 'premium');

            await browser.close();
        } catch (error) {
            console.log(error);
        }
    },
    async getXboxGamePass(browser, type) { 
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
            const page = await browser.newPage();
            await page.goto('https://www.xbox.com/pt-PT/xbox-game-pass/games', { waitUntil: 'networkidle0' });
            await page.waitForSelector(`[data-theplat="${type}"]`);
            await page.click(`[data-theplat="${type}"]`);
            
            const items = [];
            let hasMore = true;
            while(hasMore) {
                await page.waitForSelector('.gameList [itemtype="http://schema.org/Product"]');

                const data = await page.$$eval('.gameList [itemtype="http://schema.org/Product"]', (elements) =>
                    elements.map(item => ({ name: item.querySelector('h3').textContent, url: item.querySelector('a').href }))
                );

                items.push(...data.map(item => ({ name: item.name, slug: slug(item.name), url: item.url })));

                await page.waitForTimeout(1000);
                hasMore = (await page.$$('.paginatenext:not(.pag-disabled) a')).length > 0;
                if(hasMore) await page.click('.paginatenext:not(.pag-disabled) a');
            }
            await page.close();

            items.length > 0 && await subscriptionsSchema.updateOne({ subscription: `Xbox Game Pass for ${platform}` }, { $set: { items } }, { upsert: true });
        } catch (error) {
            console.log(error);
        }
    },
    async getUbisoftPlus(browser) { 
        try {
            const page = await browser.newPage();
            await page.goto('https://store.ubi.com/eu/ubisoftplus/games', { waitUntil: 'networkidle0' });

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
            await page.close();

            const items = [];
            items.push(...data.map(item => ({ name: item.name, slug: slug(item.name) })));

            items.length > 0 && await subscriptionsSchema.updateOne({ subscription: `Ubisoft+ for PC` }, { $set: { items } }, { upsert: true });
        } catch (error) {
            console.log(error);
        }
    },
    async getEAPlay(browser, type) {
        const getType = (type) => {
            const options = {
                'base': 'vault-games',
                'premium': 'premium-vault-games'
            }
            return options[type] || null;
        }
        const subscription_type = getType(type);
        if(!subscription_type) return;
        try {
            const page = await browser.newPage();
            await page.goto(`https://www.origin.com/irl/en-us/store/browse?fq=subscriptionGroup:${subscription_type}`, { waitUntil: 'networkidle0' });

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
            await page.close();

            const items = [];
            items.push(...data.map(item => ({ name: item.name, slug: slug(item.name), url: item.url })));

            items.length > 0 && await subscriptionsSchema.updateOne({ subscription: `${type === 'premium' ? 'EA Play Pro' : 'EA Play'}` }, { $set: { items } }, { upsert: true });
        } catch (error) {
            console.log(error);
        }
    }
}