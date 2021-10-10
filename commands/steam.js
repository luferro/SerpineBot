const fetch = require('node-fetch');
const cheerio = require('cheerio');
const UserAgent = require('user-agents');
const steamSchema = require('../models/steamSchema');
const Wishlists = require('../worker/wishlists');
const Leaderboards = require('../worker/leaderboards');
const { erase } = require('../utils/message');

module.exports = {
	name: 'steam',
    async getSteam(client, message, args) {
        erase(message, 5000);

        const query = args.slice(1).join(' ').toLowerCase();
        const hasParams = ['historical', 'import', 'profile', 'wishlist'].some(item => query.includes(item));
        switch (hasParams ? args[1] : query) {
            case 'sale': return await this.getNextSale(message);
            case 'top played': return await this.getTopPlayed(message);
            case 'top sellers': return await this.getTopSellers(message);
            case 'upcoming': return await this.getUpcoming(message);
            case 'historical': return await this.getHistoricalLowest(message);
            case 'leaderboard': return await this.getLeaderboard(message);
            case 'import': return await this.addIntegration(message);
            case 'sync': return await this.syncIntegration(message);
            case 'profile': return await this.getProfile(client, message);
            case 'wishlist': return await this.getWishlist(client, message);
            case 'delete': return await this.deleteIntegration(message);
            default: return message.channel.send('./cmd steam');
        }
    },
    async getNextSale(message) {
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
    },
    async getTopPlayed(message) {
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
    },
    async getTopSellers(message) {
        const res = await fetch('https://store.steampowered.com/search/?filter=topsellers&os=win', { headers: { 'User-Agent': new UserAgent().toString() } });
        const html = await res.text();
        const $ = cheerio.load(html);

        const sellers = [];
        $('.search_result_row').each((i, element) => {
            const url = $(element).first().attr('href');
            const name = $(element).find('.responsive_search_name_combined .title').first().text();
        
            const hasEntry = sellers.some(item => item.name === name && item.url === url);
            !hasEntry && sellers.push({ name, url });
        });
        const array = sellers.map((item, index) => `\`${index + 1}.\` **[${item.name}](${item.url})**`);
        array.length = 10;

        message.channel.send({ embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: 'Steam Top Sellers',
            description: array.length > 0 ? array.join('\n') : 'N/A',
            footer: {
                text: 'Powered by Steam.'
            }
        }});
    },
    async getUpcoming(message) {
        const res = await fetch('https://store.steampowered.com/search/?filter=popularcomingsoon&os=win', { headers: { 'User-Agent': new UserAgent().toString() } });
        const html = await res.text();
        const $ = cheerio.load(html);

        const upcoming = [];
        $('.search_result_row').each((i, element) => {
            const url = $(element).first().attr('href');
            const name = $(element).find('.responsive_search_name_combined .title').first().text();
        
            const hasEntry = upcoming.some(item => item.name === name && item.url === url);
            !hasEntry && upcoming.push({ name, url });
        });
        const array = upcoming.map((item, index) => `\`${index + 1}.\` **[${item.name}](${item.url})**`);
        array.length = 10;

        message.channel.send({ embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: 'Steam Upcoming',
            description: array.length > 0 ? array.join('\n') : 'N/A',
            footer: {
                text: 'Powered by Steam.'
            }
        }});
    },
    async getHistoricalLowest(message) {
        const query = message.content.split(' ').slice(2).join(' ');

        const res = await fetch(`https://isthereanydeal.com/search/?q=${query}`, { headers: { 'User-Agent': new UserAgent().toString() } });
        const html = await res.text();
        const $ = cheerio.load(html);

        const href = $('a.card__title').first().attr('href');
        if(!href) return message.channel.send(`Couldn't find a match for ${query}.`).then(m => { m.delete({ timeout: 5000 }) });

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
            return logs.filter(item => parseFloat(item.lowest.replace(',', '.')) === lowestValue);
        }

        const { name, image, details } = await getDetails(href);
        const historicalLows = await getRecords(href);
        if(details.length === 0 || historicalLows.length === 0) return message.channel.send(`Couldn't find any data for ${query}'s historical lows on Steam.`).then(m => { m.delete({ timeout: 5000 }) });

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
    },
    async getLeaderboard(message) {
        const data = await Leaderboards.getSteamRecentlyPlayed();

        const stats = data.map((item, index) => {
            const medal = Leaderboards.getMedal(index);

            return( 
                `> ${medal ? medal : `\`${index + 1}.\``} **${item.tag}** with \`${item.weeklyHours}h\`
                > Top played game was **[${item.topPlayed}](${item.topPlayedURL})**`
            );
        });
        if(stats.length === 0) return message.channel.send('No leaderboard is available.').then(m => { m.delete({ timeout: 5000 }) });

        message.channel.send({ embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: 'Weekly Steam Leaderboard',
            description: stats.join('\n'),
            footer: {
                text: 'Leaderboard resets every sunday at 14:00'
            }
        }});
    },
    async addIntegration(message) {
        const url = message.content.split(' ').slice(2).join(' ');
        const profile = url.match(/https?:\/\/steamcommunity\.com\/(profiles|id)\/([a-zA-Z0-9]+)/);
        if(!profile) return message.channel.send('Invalid Steam profile URL.').then(m => {m.delete({ timeout: 5000 })});

        const profileURL = profile[0];
        const profileType = profile[1];
        const profileUser = profile[2];
        const wishlistURL = `https://store.steampowered.com/wishlist/${profileType}/${profileUser}#sort=order`;

        const items = await Wishlists.getItems(wishlistURL);
        if(items.error) return message.channel.send(items.error).then(m => {m.delete({ timeout: 5000 })});

        const integrationInfo = {
            tag: message.author.tag,
            type: profileType,
            profile: profileUser,
            url: profileURL,
            wishlist: {
                url: wishlistURL,
                items: items.map(item => ({ ...item, notified: false }))
            }
        }

        await steamSchema.updateOne({ user: message.author.id }, { $set: integrationInfo }, { upsert: true });

        message.channel.send({ embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: 'Steam profile imported successfully!'
        }}).then(m => {m.delete({ timeout: 5000 })});
    },
    async syncIntegration(message) {
        const steam = await steamSchema.find({ user: message.author.id });
        if(steam.length === 0) return message.channel.send('No integration with Steam found. Import your Steam profile.').then(m => {m.delete({ timeout: 5000 })});

        const items = await Wishlists.getItems(steam[0].wishlist.url);
        if(items.error) return message.channel.send(items.error).then(m => {m.delete({ timeout: 5000 })});

        for(const item of items) {
            const game = steam[0]?.wishlist.items.find(element => element.name === item.name);
            item.notified = game?.notified || false;
        }

        await steamSchema.updateOne({ user: message.author.id }, { $set: { 'wishlist.items': items } }, { upsert: true });

        message.channel.send({ embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: 'Steam wishlist synced successfully!'
        }}).then(m => {m.delete({ timeout: 5000 })});
    },
    async getProfile(client, message) {
        const mention = message.content.split(' ').slice(2).join(' ');
        const username = mention.length === 0 ? message.author.id : mention.slice(3, mention.length - 1);

        const user = await client.users.fetch(username);
        if(!user) return message.channel.send(`Couldn\'t find a match for ${username}.`).then(m => {m.delete({ timeout: 5000 })});

        const steam = await steamSchema.find({ user: user.id });
        if(steam.length === 0) return message.channel.send('No integration with Steam found. Import your Steam profile.').then(m => {m.delete({ timeout: 5000 })});
        
        const res = await fetch(steam[0].url, { headers: { 'User-Agent': new UserAgent().toString() } });
        const html = await res.text();
        const $ = cheerio.load(html);

        const name = $('.profile_header_content .persona_name span').first().text().trim();
        const image = $('.profile_header_content .playerAvatar > div > img').first().attr('src');
        const friends = $('.profile_friend_links .profile_count_link_total').first().text().trim();
        const games = $('.profile_item_links .profile_count_link_total').first().text().trim();
        const activity = $('.recentgame_recentplaytime h2').first().text().trim();
        const favoriteGame = {
            name: $('.favoritegame_showcase_game .showcase_item_detail_title a').first().text().trim(),
            url: $('.favoritegame_showcase_game .showcase_item_detail_title a').first().attr('href')
        };
        const lastSeenPlaying = {
            name: $('.recent_game .game_name a').first().text().trim(),
            url: $('.recent_game .game_name a').first().attr('href')
        }
        
        message.channel.send({ embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: name,
            url: steam[0].url,
            fields: [
                {
                    name: 'Friends',
                    value: friends ? friends : 'N/A',
                    inline: true
                },
                {
                    name: 'Games',
                    value: games ? games : 'N/A',
                    inline: true
                },
                {
                    name: 'Favorite Game',
                    value: favoriteGame.name && favoriteGame.url ? `**[${favoriteGame.name}](${favoriteGame.url})**` : 'N/A'
                },
                {
                    name: 'Recent activity',
                    value: activity ? activity : 'N/A'
                },
                {
                    name: 'Last seen playing',
                    value: lastSeenPlaying.name && lastSeenPlaying.url ? `**[${lastSeenPlaying.name}](${lastSeenPlaying.url})**` : 'N/A'
                }
            ],
            thumbnail: {
                url: image ? image : ''
            },
        }});
    },
    async getWishlist(client, message) {
        const mention = message.content.split(' ').slice(2).join(' ');
        const username = mention.length === 0 ? message.author.id : mention.slice(3, mention.length - 1);

        const user = await client.users.fetch(username);
        if(!user) return message.channel.send(`Couldn\'t find a match for ${username}.`).then(m => {m.delete({ timeout: 5000 })});
        
        const steam = await steamSchema.find({ user: user.id });
        if(steam.length === 0) return message.channel.send('No integration with Steam found. Import your Steam profile.').then(m => {m.delete({ timeout: 5000 })});

        const items = await Wishlists.getItems(steam[0].wishlist.url);
        if(items.error) return message.channel.send(items.error).then(m => {m.delete({ timeout: 5000 })}); 

        const list = items.slice(0, 10).map(item => `> **[${item.name}](${item.url})** | ${item.discounted ? item.discounted : item.free ? 'Free' : 'N/A'}`);
        items.length - list.length > 0 && list.push(`And ${items.length - list.length} more!`);
        
        message.channel.send({ embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: `\`${user.tag}\`'s wishlist`,
            url: steam[0].wishlist.url,
            description: list.length > 0 ? list.join('\n') : ''
        }});
    },
    async deleteIntegration(message) {
        await steamSchema.deleteOne({ user: message.author.id });

        message.channel.send({ embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: 'Steam integration deleted successfully!'
        }}).then(m => {m.delete({ timeout: 5000 })});
    }
};