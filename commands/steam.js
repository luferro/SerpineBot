const fetch = require('node-fetch');
const cheerio = require('cheerio');
const UserAgent = require('user-agents');
const wishlistsSchema = require('../models/wishlistsSchema');
const Wishlists = require('../worker/wishlists');

module.exports = {
	name: 'steam',
    async getSteam(client, message, args) {
        message.delete({ timeout: 5000 });

        const steam_query =  args.slice(1).join(' ');
        const hasParams = ['low', 'import', 'wishlist'].some(item => steam_query.includes(item));
        switch (hasParams ? args[1] : steam_query.toLowerCase()) {
            case 'sale': return this.getNextSale(message);
            case 'top played': return this.getTopPlayed(message);
            case 'top sellers': return this.getTopSellers(message);
            case 'upcoming': return this.getUpcoming(message);
            case 'low': return this.getHistoricalLowest(message);
            case 'import': return this.importWishlist(message);
            case 'sync': return this.syncWishlist(message);
            case 'wishlist': return this.getWishlist(client, message);
            case 'delete': return this.deleteWishlist(message);
            default: return message.channel.send('./cmd steam');
        }
    },
    async getNextSale(message) {
        try {
            const res = await fetch('https://prepareyourwallet.com/', { headers: { 'User-Agent': new UserAgent().toString() } });
            const html = await res.text();
            const $ = cheerio.load(html);

            const sale = $('p').first().attr('content');
            const status = $('span.status').first().text();

            const upcomingSales = [];
            $('.row').first().children('div').each((i, element) => {
                const name = $(element).find('span').first().text();
                const date = $(element).find('p').first().text().trim();
                const fixedDate = date ? date.replace(/Confirmed|Not confirmed/, '').trim() : '';
                
                upcomingSales.push(`> __${name}__ ${fixedDate}`);
            });

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'When is the next Steam sale?',
                description: `
                    *${status ? status : ''}*
                    **${sale ? sale : 'Couldn\'t find the next steam sale.'}**
                `,
                fields: [
                    {
                        name: 'Upcoming Sales',
                        value: upcomingSales.length > 0 ? upcomingSales.join('\n') : 'N/A'
                    }
                ],
                footer: {
                    text: 'Powered by prepareyourwallet.'
                }
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async getTopPlayed(message) {
        try {
            const res = await fetch('https://store.steampowered.com/stats/', { headers: { 'User-Agent': new UserAgent().toString() } });
            const html = await res.text();
            const $ = cheerio.load(html);

            const played = [];
            $('.player_count_row').each((i, element) => {
                const url = $(element).find('a').first().attr('href');
                const name = $(element).find('a').first().text();

                played.push(`\`${i + 1}.\` **[${name}](${url})**`);
            });
            played.length = 10;

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'Steam Top Played',
                description: played.length > 0 ? played.join('\n') : 'N/A',
                footer: {
                    text: 'Powered by Steam.'
                }
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async getTopSellers(message) {
        try {
            const res = await fetch('https://store.steampowered.com/search/?filter=topsellers&os=win', { headers: { 'User-Agent': new UserAgent().toString() } });
            const html = await res.text();
            const $ = cheerio.load(html);

            const sellers = [];
            $('.search_result_row').each((i, element) => {
                const url = $(element).first().attr('href');
                const name = $(element).children('.responsive_search_name_combined').find('.title').first().text();
            
                sellers.push(`\`${i + 1}.\` **[${name}](${url})**`);
            });
            sellers.length = 10;

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'Steam Top Sellers',
                description: sellers.length > 0 ? sellers.join('\n') : 'N/A',
                footer: {
                    text: 'Powered by Steam.'
                }
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async getUpcoming(message) {
        try {
            const res = await fetch('https://store.steampowered.com/search/?filter=popularcomingsoon&os=win', { headers: { 'User-Agent': new UserAgent().toString() } });
            const html = await res.text();
            const $ = cheerio.load(html);

            const upcoming = [];
            $('.search_result_row').each((i, element) => {
                const url = $(element).first().attr('href');
                const name = $(element).children('.responsive_search_name_combined').find('.title').first().text();
            
                upcoming.push(`\`${i + 1}.\` **[${name}](${url})**`);
            });
            upcoming.length = 10;

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'Steam Upcoming',
                description: upcoming.length > 0 ? upcoming.join('\n') : 'N/A',
                footer: {
                    text: 'Powered by Steam.'
                }
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async getHistoricalLowest(message) {
        const game_query = message.content.split(' ').slice(2).join(' ');
        try {
            const res = await fetch(`https://isthereanydeal.com/search/?q=${game_query}`, { headers: { 'User-Agent': new UserAgent().toString() } });
            const html = await res.text();
            const $ = cheerio.load(html);

            const href = $('a.card__title').first().attr('href');
            if(!href) return message.channel.send(`Couldn't find a match for ${game_query}.`).then(m => { m.delete({ timeout: 5000 }) });

            const getDetails = async(href) => {
                const res = await fetch(`https://isthereanydeal.com${href}`, { headers: { 'User-Agent': new UserAgent().toString() } });
                const html = await res.text();
                const $ = cheerio.load(html);

                const details = [];
                $('.priceTable tr').each((i, element) => {
                    const store = $(element).find('.priceTable__shop a').first().text();
                    const url = $(element).find('.priceTable__shop a').first().attr('href');
                    const regular = $(element).find('.priceTable__old').first().text();
                    const current = $(element).find('.priceTable__new').first().text();

                    if(store === 'Steam') details.push({ url, regular, current });
                });

                return { name: $('#gameTitle a').first().text(), image: $('#gameHead__img').first().css('background-image')?.replace(/^url\(['"](.+)['"]\)/, '$1'), details };
            }

            const getRecords = async(href) => {
                const res = await fetch(`https://isthereanydeal.com${href.replace('info', 'history')}?shop[]=steam`, { headers: { 'User-Agent': new UserAgent().toString() } });
                const html = await res.text();
                const $ = cheerio.load(html);

                const logs = [];
                $('#historyLogContent .game').each((i, element) => {
                    const store = $(element).find('.shopTitle').first().text();
                    const discount = $(element).find('.lg2__group').last().find('.lg2__cut').first().text();
                    const lowest = $(element).find('.lg2__group').last().find('.lg2__price').first().text();
                    const duration = $(element).find('.lg2__time-rel i').first().text();
                    const recorded = $(element).find('.lg2__time-rel').first().attr('title');

                    if(store === 'Steam') logs.push({ discount, lowest, duration, recorded: new Date(recorded).toISOString().split('T')[0] });
                });

                const lowestValue = Math.min(...logs.map(item => parseFloat(item.lowest.replace(',', '.'))));         
                const filteredLogs = logs.filter(item => parseFloat(item.lowest.replace(',', '.')) === lowestValue);

                return filteredLogs;
            }

            const { name, image, details } = await getDetails(href);
            const historicalLows = await getRecords(href);
            if(details.length === 0 || historicalLows.length === 0) return message.channel.send(`Couldn't find any data for ${game_query}'s historical lows on Steam.`).then(m => { m.delete({ timeout: 5000 }) });

            historicalLows.length = historicalLows.length > 10 ? 10 : historicalLows.length;

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: name,
                url: details[0].url,
                fields: [
                    {
                        name: 'Store',
                        value: 'Steam',
                        inline: true
                    },
                    {
                        name: 'Regular price',
                        value: details[0].regular,
                        inline: true
                    },
                    {
                        name: 'Current price',
                        value: details[0].current,
                        inline: true
                    },
                    {
                        name: 'Historical Low',
                        value: historicalLows.map((item, index) => index === 0 ? `> **${item.discount} | ${item.lowest}**` : `> ${item.discount} | ${item.lowest}`),
                        inline: true
                    },
                    {
                        name: 'Duration',
                        value: historicalLows.map((item, index) => index === 0 ? `> **${item.duration}**` : `> ${item.duration}`),
                        inline: true
                    },
                    {
                        name: 'Recorded',
                        value: historicalLows.map((item, index) => index === 0 ? `> **${item.recorded}**` : `> ${item.recorded}`),
                        inline: true
                    }
                ],
                thumbnail: {
                    url: image ? image : ''
                },
                footer: {
                    text: 'Powered by IsThereAnyDeal.'
                }
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async importWishlist(message) {
        const url = message.content.split(' ').slice(2).join(' ');
        if(!url.includes('://store.steampowered.com/wishlist')) return message.channel.send('Invalid Steam wishlist URL.').then(m => {m.delete({ timeout: 5000 })});
        try {
            const items = await Wishlists.getWishlistItems(url);
            if(items.error) return message.channel.send(items.error).then(m => {m.delete({ timeout: 5000 })});

            const wishlistInfo = {
                list: url,
                items: items.map(item => ({ ...item, notified: false }))
            }

            await wishlistsSchema.updateOne({ user: message.author.id, tag: message.author.tag }, { $set: wishlistInfo }, { upsert: true });

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'Steam wishlist imported successfully!'
            }}).then(m => {m.delete({ timeout: 5000 })});
        } catch (error) {
            console.log(error);
        }
    },
    async syncWishlist(message) {
        try {
            const wishlist = await wishlistsSchema.find({ user: message.author.id });
            if(wishlist.length === 0) return message.channel.send('You didn\'t import your Steam wishlist.').then(m => {m.delete({ timeout: 5000 })});

            const items = await Wishlists.getWishlistItems(wishlist[0].list);
            if(items.error) return message.channel.send(items.error).then(m => {m.delete({ timeout: 5000 })});

            for (const item of items) {
                const game = wishlist[0]?.items.find(element => element.name === item.name);
                item.notified = game?.notified || false;
            }

            await wishlistsSchema.updateOne({ user: message.author.id, tag: message.author.tag }, { $set: { items } }, { upsert: true });

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'Steam wishlist synced successfully!'
            }}).then(m => {m.delete({ timeout: 5000 })});
        } catch (error) {
            console.log(error);
        }
    },
    async getWishlist(client, message) {
        const mention = message.content.split(' ').slice(2).join(' ');
        const username = mention.length === 0 ? message.author.id : mention.slice(3, mention.length - 1);
        try {
            const user = await client.users.fetch(username);
            if(!user) return message.channel.send(`Couldn\'t find a match for ${username}.`).then(m => {m.delete({ timeout: 5000 })});
            
            const wishlist = await wishlistsSchema.find({ user: user.id });
            if(wishlist.length === 0) return message.channel.send('You didn\'t import your Steam wishlist.').then(m => {m.delete({ timeout: 5000 })});

            const items = await Wishlists.getWishlistItems(wishlist[0].list);
            if(items.error) return message.channel.send(items.error).then(m => {m.delete({ timeout: 5000 })}); 

            const list = items.slice(0, 10).map(item => `> **[${item.name}](${item.url})** | ${item.discounted ? item.discounted : item.free ? 'Free' : 'N/A'}`);
            items.length - list.length > 0 && list.push(`And ${items.length - list.length} more!`);
            
            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: `\`${wishlist[0].tag}\`'s wishlist`,
                url: wishlist[0].list,
                description: list.length > 0 ? list.join('\n') : ''
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async deleteWishlist(message) {
        try {
            await wishlistsSchema.deleteOne({ user: message.author.id });

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'Steam wishlist deleted successfully!'
            }}).then(m => {m.delete({ timeout: 5000 })});
        } catch (error) {
            console.log(error);
        }
    }
};
