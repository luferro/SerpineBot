require('dotenv').config();

const addReactions = (message, reactions) => {
    message.react(reactions[0]);
    reactions.shift();
    if(reactions.length > 0)
        setTimeout(() => addReactions(message, reactions), 750);
}

module.exports = {
    name: 'roles',
    async execute(client){ 
        const channel = await client.channels.fetch(process.env.BOT_ROLES_CHANNEL);

        let text = `
            Choose from the following reactions to claim a role!\nYou can select **multiple** roles.\nEach role will give you access to a text channel as represented below.
        `;

        const getEmoji = emojiName => client.emojis.cache.find(emoji => emoji.name === emojiName);

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
            ten: 'Nintendo'
        }

        const reactions = [];
        for(const key in emojis){
            const emoji = getEmoji(key);
            reactions.push(emoji);
            text += `\n${emoji} -> __**${emojis[key]}**__ text channel`
        }

        channel.messages.fetch().then((messages) => {
            if(messages.size === 0) {
                channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Get your roles here!',
                    description: text.trim()
                }}).then((message) => {
                    addReactions(message, reactions);
                })
            }
            else {
                for(const message of messages) {
                    message[1].edit({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: 'Get your roles here!',
                        description: text.trim()
                    }});
                    addReactions(message[1], reactions);
                }
            }
        })

        const handleReaction = (reaction, user, add) => {
            const emoji = reaction._emoji.name;
            const { guild } = reaction.message;
            const roleName = emojis[emoji];

            if(!roleName) return;

            const role = guild.roles.cache.find(role => role.name === roleName);
            const member = guild.members.cache.find(member => member.id === user.id);

            if(add) member.roles.add(role);
            else member.roles.remove(role);
        }

        client.on('messageReactionAdd', (reaction, user) => {
            if(reaction.message.channel.id === process.env.BOT_ROLES_CHANNEL) {
                handleReaction(reaction, user, true);
            }
        })
        
        client.on('messageReactionRemove', (reaction, user) => {
            if(reaction.message.channel.id === process.env.BOT_ROLES_CHANNEL) {
                handleReaction(reaction, user, false);
            }
        })
    }
    
}