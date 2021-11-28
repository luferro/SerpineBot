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

const createRolesMessage = async client => {
    try {
        const channel = await client.channels.fetch(process.env.ROLES_CHANNEL);

        const reactions = [];
        const list = Object.keys(emojis).map(item => {
            const emoji = client.emojis.cache.find(emoji => emoji.name === item);
            reactions.push(emoji);

            return `> ${emoji} __**${emojis[item]}**__`;
        });

        const messages = await channel.messages.fetch();
        if(messages.size === 0) {
            const message = await channel.send({ embeds: [
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
            return addReactions(message, reactions);
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
    } catch (error) {
        console.log(error);
    }
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

export default { createRolesMessage, handleReaction };