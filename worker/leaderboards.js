const fetch = require('node-fetch');
const cheerio = require('cheerio');
const UserAgent = require('user-agents');
const steamSchema = require('../models/steamSchema');

module.exports = {
	name: 'leaderboards',
    getMedal(type) {
        const options = {
            0: '🥇',
            1: '🥈',
            2: '🥉'
        }
        return options[type] || null;
    },
    async getSteamRecentlyPlayed() {
        const data = [];
        try {
            const profiles = await steamSchema.find();
            for(const profile of profiles) {
                if(!profile.recentlyPlayed || profile.recentlyPlayed.length === 0) continue;

                const res = await fetch(`${profile.url}/games/?tab=recent`, { headers: { 'User-Agent': new UserAgent().toString() } });
                const html = await res.text();
                const $ = cheerio.load(html);
                
                const script = $('.responsive_page_template_content > script').first().get(0).children[0].data.trim();
                const string = script.substring(script.indexOf('['), script.indexOf(';'));
                const array = JSON.parse(string);
                
                const games = array.map(item => ({
                    id: item.appid,
                    name: item.name,
                    twoWeeksHours: parseFloat(item.hours),
                    totalHours: parseFloat((item.hours_forever || item.hours).replace(',', ''))
                })).filter(item => item.twoWeeksHours);

                const recentlyPlayed = [];
                for(const game of games) {
                    const storedItem = profile.recentlyPlayed.find(item => item.id === game.id);
                    const weeklyHours = storedItem ? game.totalHours - storedItem.totalHours : game.twoWeeksHours;

                    recentlyPlayed.push({ name: game.name, url: `https://store.steampowered.com/app/${game.id}`, weeklyHours });
                }
                const topPlayed = recentlyPlayed.reduce((acc, el) => el.weeklyHours > acc.weeklyHours ? el : acc);
                const weeklyHours = recentlyPlayed.reduce((acc, el) => acc + el.weeklyHours, 0);

                data.push({ user: profile.user, tag: profile.tag, games, topPlayed: topPlayed.name, topPlayedURL: topPlayed.url, weeklyHours: parseFloat(weeklyHours.toFixed(1)) });
            }
            return data.sort((a, b) => b.weeklyHours - a.weeklyHours).slice(0, 10);
        } catch (error) {
            console.log(error);
        }
    },
    async getSteamLeaderboard(client) {
        try {
            const data = await this.getSteamRecentlyPlayed();

            for(const item of data) {
                const user = await client.users.fetch(item.user);
                const updatedData = { tag: user.tag, recentlyPlayed: item.games };
                await steamSchema.updateOne({ user: item.user }, { $set: updatedData });
            }

            const stats = data.map((item, index) => {
                const medal = this.getMedal(index);

                return( 
                    `> ${medal ? medal : `\`${index + 1}.\``} **${item.tag}** with \`${item.weeklyHours}h\`
                    > Top played game was **[${item.topPlayed}](${item.topPlayedURL})**`
                );
            });
            if(stats.length === 0) return;

            const channel = await client.channels.fetch(process.env.GENERAL_CHANNEL);
            channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: 'Weekly Steam Leaderboard',
                description: stats.join('\n'),
                footer: {
                    text: 'Leaderboard resets every sunday at 14:00'
                }
            }});
        } catch (error) {
            console.log(error);
        }
    }
};