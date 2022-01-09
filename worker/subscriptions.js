import puppeteer from 'puppeteer';
import { slug } from '../utils/slug.js';
import subscriptionsSchema from '../models/subscriptionsSchema.js';

const getSubscriptions = async () => {
    let browser, page;
    try {
        browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        page = await browser.newPage();

        await page.setRequestInterception(true);
        page.on('request', req => {
            const hasResource = ['font', 'image'].some(item => item === req.resourceType());
            if(hasResource) req.abort();
            else req.continue();
        });

        await getXboxGamePass(page);
        await getUbisoftPlus(page);
        await getEAPlay(page);
    } finally {
        page && await page.close();
        browser && await browser.close();
    }
}

const getXboxGamePass = async page => {
    const categories = ['Console', 'PC'];
   
    for(const category of categories) {
        await page.goto('https://www.xbox.com/pt-PT/xbox-game-pass/games', { waitUntil: 'networkidle0' });
        await page.waitForTimeout(1000);

        if(category === 'PC') {
            await page.waitForSelector(`[data-theplat="pc"]`);
            await page.click(`[data-theplat="pc"]`);

            const selectedPlatform = await page.evaluate(() => document.querySelector('[data-platselected]').getAttribute('data-platselected'));
            if(selectedPlatform === 'xbox') continue;
        }
    
        const array = [];
        let hasMore = true;
        while (hasMore) {
            await page.waitForSelector('.gameList [itemtype="http://schema.org/Product"]');
    
            const data = await page.$$eval('.gameList [itemtype="http://schema.org/Product"]', elements => elements.map(item => ({ name: item.querySelector('h3').textContent, url: item.querySelector('a').href })));
            array.push(...data.map(item => ({ name: item.name, slug: slug(item.name), url: item.url })));
    
            await page.waitForTimeout(1000);
            hasMore = (await page.$$('.paginatenext:not(.pag-disabled) a')).length > 0;
            if(hasMore) await page.click('.paginatenext:not(.pag-disabled) a');
        }
    
        const storedSubscription = await subscriptionsSchema.find({ subscription: `Xbox Game Pass for ${category}` });
        if(array.length < Math.round(storedSubscription[0].items.length * 0.6)) continue;
    
        await subscriptionsSchema.updateOne({ subscription: `Xbox Game Pass for ${category}` }, { $set: { items: array, count: array.length } }, { upsert: true });   
    }
}

const getUbisoftPlus = async page => {
    await page.goto('https://store.ubi.com/eu/ubisoftplus/games', { waitUntil: 'networkidle0', timeout: 0 });
    await page.waitForTimeout(1000);

    const hasCookiesMenu = (await page.$$('button#privacy__modal__accept')).length > 0;
    if(hasCookiesMenu) await page.click('button#privacy__modal__accept')

    const hasRegionMenu = (await page.$$('button.stay-on-country-store')).length > 0;
    if(hasRegionMenu)await page.click('button.stay-on-country-store');

    let hasMore = true;
    while (hasMore) {
        await page.waitForTimeout(1000);
        hasMore = (await page.$$('main > :last-child > :first-child > :last-child > :nth-child(4) > button')).length > 0;
        if(hasMore) await page.click('main > :last-child > :first-child > :last-child > :nth-child(4) > button');
    }

    const array = [];
    const data = await page.$$eval('.game-list_inner > div', elements => elements.map(item => ({ name: item.querySelector('h3.game-short-title').textContent || item.querySelector('h3.game-long-title').textContent })));
    array.push(...data.map(item => ({ name: item.name, slug: slug(item.name) })));

    const storedSubscription = await subscriptionsSchema.find({ subscription: 'Ubisoft+ for PC' });
    if(array.length < Math.round(storedSubscription[0].items.length * 0.6)) return;

    await subscriptionsSchema.updateOne({ subscription: 'Ubisoft+ for PC' }, { $set: { items: array, count: array.length } }, { upsert: true });
}

const getEAPlay = async page => {
    const categories = ['vault-games', 'premium-vault-games'];

    for(const category of categories) {
        await page.goto(`https://www.origin.com/irl/en-us/store/browse?fq=subscriptionGroup:${category}`, { waitUntil: 'networkidle0' });
        await page.waitForTimeout(1000);

        const hasRegionMenu = (await page.$$('.otkmodal-content .otkmodal-footer > button')).length > 0;
        if(hasRegionMenu) {
            await page.click('.otkmodal-content .otkmodal-footer > button');
            await page.waitForTimeout(2000);

            const hasConfirmationRegionMenu = (await page.$$('.otkmodal-content .otkmodal-footer > button')).length > 0;
            if(hasConfirmationRegionMenu) await page.click('.otkmodal-content .otkmodal-footer > button');
        }

        await page.waitForSelector('section.origin-gdp-tilelist > ul li[origin-postrepeat]');
    
        await page.waitForTimeout(1000);
        await page.evaluate(async () => {
            await new Promise(resolve => {
                let totalHeight = 0;
                let distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
    
                    if(totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 200);
            });
        });
        await page.waitForTimeout(1000);
    
        const array = [];
        const data = await page.$$eval('section.origin-gdp-tilelist > ul li[origin-postrepeat]', (elements) => elements.map(item => ({ name: item.querySelector('h1.home-tile-header').textContent, url: item.querySelector('a').href })));
        array.push(...data.map(item => ({ name: item.name, slug: slug(item.name), url: item.url })));
    
        const subscription = category === 'vault-games' ? 'EA Play' : 'EA Play Pro';
        const storedSubscription = await subscriptionsSchema.find({ subscription });
        if(array.length < Math.round(storedSubscription[0].items.length * 0.6)) continue;
    
        await subscriptionsSchema.updateOne({ subscription }, { $set: { items: array, count: array.length } }, { upsert: true });
    }
}

export default { getSubscriptions };