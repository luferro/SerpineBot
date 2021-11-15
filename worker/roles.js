import { MessageEmbed } from 'discord.js';

const emojis = {
    one: 'NSFW',
    two: 'Memes',
    three: 'Gaming News',
    four: 'Reviews',
    five: 'Deals',
    six: 'Free Games',
    seven: 'Patch Notes',
    eight: 'Xbox',
    nine: 'Playstation',
    ten: 'Nintendo',
    eleven: 'Anime',
    twelve: 'Manga'
}

const setup = async client => {
    const channel = await client.channels.fetch(process.env.BOT_ROLES_CHANNEL);

    const reactions = [], list = [];
    for(const key in emojis) {
        const emoji = client.emojis.cache.find(emoji => emoji.name === key);
        reactions.push(emoji);
        list.push(`> ${emoji} __**${emojis[key]}**__`);
    }

    channel.messages.fetch().then(messages => {
        if(messages.size === 0) {
            return channel.send({ embeds: [
                    new MessageEmbed()
                        .setTitle('Get your roles here!')
                        .setDescription(`
                            > React to this message to claim your roles!
                            > Each role will give you access to a text channel.
                            \n**NOTE:** Users with role \`Restrictions\` won't be assigned the __**NSFW**__ role.\n
                            ${list.join('\n')}
                        `)
                        .setColor(Math.floor(Math.random() * 16777214) + 1)
            ]}).then(message => addReactions(message, reactions));
        }

        for(const message of messages) {
            message[1].edit({ embeds: [
                    new MessageEmbed()
                        .setTitle('Get your roles here!')
                        .setDescription(`
                            > React to this message to claim your roles!
                            > Each role will give you access to a text channel.
                            \n**NOTE:** Users with role \`Restrictions\` won't be assigned the __**NSFW**__ role.\n
                            ${list.join('\n')}
                        `)
                        .setColor(Math.floor(Math.random() * 16777214) + 1)
            ]});
            addReactions(message[1], reactions);
        }
    });

    client.on('messageReactionAdd', (reaction, user) => {
        if(reaction.message.channel.id === process.env.BOT_ROLES_CHANNEL) handleReaction(reaction, user, true);
    });

    client.on('messageReactionRemove', (reaction, user) => {
        if(reaction.message.channel.id === process.env.BOT_ROLES_CHANNEL) handleReaction(reaction, user, false);
    });
}

const addReactions = (message, reactions) => {
    message.react(reactions[0]);
    reactions.shift();
    if(reactions.length > 0) setTimeout(() => addReactions(message, reactions), 750);
}

const handleReaction = (reaction, user, add) => {
    const emoji = reaction._emoji.name;
    const { guild } = reaction.message;
    const roleName = emojis[emoji];

    if(!roleName) return;

    const role = guild.roles.cache.find(role => role.name === roleName);
    const member = guild.members.cache.find(member => member.id === user.id);

    const restrictionsRole = guild.roles.cache.find(role => role.name === 'Restrictions');
    if((member.roles.cache.has(restrictionsRole.id) && role.name === 'NSFW') || member.user.bot) return;

    if(add) member.roles.add(role);
    else member.roles.remove(role);
}

export default { setup };