import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { load } from 'cheerio';
import UserAgent from 'user-agents';
import wishlists from '../worker/wishlists.js';
import leaderboards from '../worker/leaderboards.js';
import steamSchema from '../models/steamSchema.js';

const getSteam = async interaction => {
    const subcommand = interaction.options.getSubcommand();

    const getCommand = async type => {
        const options = {
            'new': async() => await getUpcoming(interaction),
            'top': async() => await getTopPlayed(interaction),
            'hot': async() => await getTopSellers(interaction),
            'sale': async() => await getNextSale(interaction),
            'profile': async() => await getProfile(interaction),
            'wishlist': async() => await getWishlist(interaction),
            'sync': async() => await syncIntegration(interaction),
            'import': async() => await addIntegration(interaction),
            'delete': async() => await deleteIntegration(interaction),
            'leaderboard': async() => await getLeaderboard(interaction)
        }
        return options[type]();
    }
    await getCommand(subcommand);
}

const getNextSale = async interaction => {
    const res = await fetch('https://prepareyourwallet.com/', { headers: { 'User-Agent': new UserAgent().toString() } });
    const html = await res.text();
    const $ = load(html);

    const sale = $('p').first().attr('content');
    const status = $('span.status').first().text();

    const upcomingSales = $('.row').first().children('div').get().map(element => {
        const name = $(element).find('span').first().text();
        const date = $(element).find('p').first().text().trim();
        const fixedDate = date?.replace(/Confirmed|Not confirmed/, '').trim() || '';

        return `> __${name}__ ${fixedDate}`;
    });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('When is the next Steam sale?')
            .setDescription(`
                *${status || ''}*\n**${sale || 'Couldn\'t find the next steam sale.'}**
            `)
            .addField('Upcoming Games', upcomingSales.length > 0 ? upcomingSales.join('\n') : 'N/A')
            .setFooter('Powered by PrepareYourWallet.')
            .setColor('RANDOM')
    ]});
}

const getTopPlayed = async interaction => {
    const res = await fetch('https://store.steampowered.com/stats/', { headers: { 'User-Agent': new UserAgent().toString() } });
    const html = await res.text();
    const $ = load(html);

    const played = $('.player_count_row').get().map((element, index) => {
        const url = $(element).find('a').first().attr('href');
        const name = $(element).find('a').first().text();

        return `\`${index + 1}.\` **[${name}](${url})**`;
    }).slice(0, 10);

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam Top Played')
            .setDescription(played.length > 0 ? played.join('\n') : 'N/A')
            .setFooter('Powered by Steam.')
            .setColor('RANDOM')
    ]});
}

const getTopSellers = async interaction => {
    const res = await fetch('https://store.steampowered.com/search/?filter=topsellers&os=win', { headers: { 'User-Agent': new UserAgent().toString() } });
    const html = await res.text();
    const $ = load(html);

    const sellersInfo = $('.search_result_row').get().map(element => {
        const url = $(element).first().attr('href');
        const name = $(element).find('.responsive_search_name_combined .title').first().text();

        return { name, url };
    });

    const sellers = sellersInfo.filter((item, index, self) => 
        index === self.findIndex(nestedItem => nestedItem.url === item.url)
    ).slice(0, 10).map((item, index) => `\`${index + 1}.\` **[${item.name}](${item.url})**`);

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam Top Sellers')
            .setDescription(sellers.length > 0 ? sellers.join('\n') : 'N/A')
            .setFooter('Powered by Steam.')
            .setColor('RANDOM')
    ]});
}

const getUpcoming = async interaction => {
    const res = await fetch('https://store.steampowered.com/search/?filter=popularcomingsoon&os=win', { headers: { 'User-Agent': new UserAgent().toString() } });
    const html = await res.text();
    const $ = load(html);

    const upcomingInfo = $('.search_result_row').get().map(element => {
        const url = $(element).first().attr('href');
        const name = $(element).find('.responsive_search_name_combined .title').first().text();

        return { name, url };
    });

    const upcoming = upcomingInfo.filter((item, index, self) => 
        index === self.findIndex(nestedItem => nestedItem.url === item.url)
    ).slice(0, 10).map((item, index) => `\`${index + 1}.\` **[${item.name}](${item.url})**`);

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam Upcoming')
            .setDescription(upcoming.length > 0 ? upcoming.join('\n') : 'N/A')
            .setFooter('Powered by Steam.')
            .setColor('RANDOM')
    ]});
}

const getLeaderboard = async interaction => {
    const data = await leaderboards.getSteamRecentlyPlayed();

    const stats = data.map((item, index) => {
        const medal = leaderboards.getMedal(index);
        return `${medal || `\`${index + 1}.\``} **${item.tag}** with \`${item.weeklyHours}h\`\nTop played game was **[${item.topPlayed}](${item.topPlayedURL})**`;
    });
    if(stats.length === 0) return interaction.reply({ content: 'No leaderboard is available.', ephemeral: true });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Weekly Steam Leaderboard')
            .setDescription(stats.join('\n'))
            .setFooter('Leaderboard resets every sunday at 14:00')
            .setColor('RANDOM')
    ]});
}

const addIntegration = async interaction => {
    const url = interaction.options.getString('url');
    const profile = url.match(/https?:\/\/steamcommunity\.com\/(profiles|id)\/([a-zA-Z0-9]+)/);
    if(!profile) return interaction.reply({ content: 'Invalid Steam profile URL.', ephemeral: true });

    const profileURL = profile[0];
    const profileType = profile[1];
    const profileUser = profile[2];
    const wishlistURL = `https://store.steampowered.com/wishlist/${profileType}/${profileUser}#sort=order`;

    const items = await wishlists.getItems(wishlistURL);
    if(items.error) return interaction.reply({ content: items.error, ephemeral: true });

    const integrationInfo = {
        tag: interaction.user.tag,
        type: profileType,
        profile: profileUser,
        url: profileURL,
        wishlist: {
            url: wishlistURL,
            items: items.map(item => ({ ...item, notified: false }))
        }
    };

    await steamSchema.updateOne({ user: interaction.user.id }, { $set: integrationInfo }, { upsert: true });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam profile imported successfully!')
            .setColor('RANDOM')
    ]});
}

const syncIntegration = async interaction => {
    const steam = await steamSchema.find({ user: interaction.user.id });
    if(steam.length === 0) return interaction.reply({ content: 'User\'s Steam profile isn\'t integrated with the bot.', ephemeral: true });

    const items = await wishlists.getItems(steam[0].wishlist.url);
    if(items.error) return interaction.reply({ content: items.error, ephemeral: true });

    for(const item of items) {
        const game = steam[0].wishlist.items.find(element => element.name === item.name);
        item.notified = game?.notified || false;
    }

    await steamSchema.updateOne({ user: interaction.user.id }, { $set: { 'wishlist.items': items } }, { upsert: true });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam wishlist synced successfully!')
            .setColor('RANDOM')
    ]});
}

const getProfile = async interaction => {
    const mention = interaction.options.getMentionable('mention');
    const user = mention?.user || interaction.user;

    const steam = await steamSchema.find({ user: user.id });
    if(steam.length === 0) return interaction.reply({ content: 'User\'s Steam profile isn\'t integrated with the bot.', ephemeral: true });

    const res = await fetch(steam[0].url, { headers: { 'User-Agent': new UserAgent().toString() } });
    const html = await res.text();
    const $ = load(html);

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
    };

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(name)
            .setURL(steam[0].url)
            .setThumbnail(image || '')
            .addField('Friends', friends?.toString() || 'N/A')
            .addField('Games', games?.toString() || 'N/A')
            .addField('Favorite Game', favoriteGame.name && favoriteGame.url ? `**[${favoriteGame.name}](${favoriteGame.url})**` : 'N/A')
            .addField('Recent Activity', activity?.toString() || 'N/A')
            .addField('Last Seen Playing', lastSeenPlaying.name && lastSeenPlaying.url ? `**[${lastSeenPlaying.name}](${lastSeenPlaying.url})**` : 'N/A')
            .setColor('RANDOM')
    ]});
}

const getWishlist = async interaction => {
    const mention = interaction.options.getMentionable('mention');
    const user = mention?.user || interaction.user;

    const steam = await steamSchema.find({ user: user.id });
    if(steam.length === 0) return interaction.reply({ content: 'User\'s Steam profile isn\'t integrated with the bot.', ephemeral: true });

    const items = await wishlists.getItems(steam[0].wishlist.url);
    if(items.error) return interaction.reply({ content: items.error, ephemeral: true });

    const list = items.slice(0, 10).map((item, index) => `\`${index + 1}.\` **[${item.name}](${item.url})** | ${item.discounted || item.free && 'Free' || 'N/A'}`);
    items.length - list.length > 0 && list.push(`And ${items.length - list.length} more!`);

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`\`${user.tag}\`'s wishlist`)
            .setURL(steam[0].wishlist.url)
            .setDescription(list.join('\n'))
            .setColor('RANDOM')
    ]});
}

const deleteIntegration = async interaction => {
    const steam = await steamSchema.find({ user: interaction.user.id });
    if(steam.length === 0) return interaction.reply({ content: 'User\'s Steam profile isn\'t integrated with the bot.', ephemeral: true });

    await steamSchema.deleteOne({ user: interaction.user.id });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam integration deleted successfully!')
            .setColor('RANDOM')
    ]});
}

export default { getSteam };