const addReactions = (message, reactions) => {
    message.react(reactions[0]);
    reactions.shift();
    if(reactions.length > 0)
        setTimeout(() => addReactions(message, reactions), 750);
}

module.exports = {
    name: 'roles',
    async execute(client){ 
        const channelID = '757030733494616196';
        const channel = await client.channels.fetch(channelID);

        let text = `
            Choose from the following reactions to claim a role!
            \nYou can select multiple roles.
            \nEach role will give you access to a text channel as represented below.\n
        `;

        const getEmoji = emojiName => client.emojis.cache.find(emoji => emoji.name === emojiName);

        const emojis = {
            one: 'Memes',
            two: 'Gaming News',
            three: 'Reviews',
            four: 'Deals',
            five: 'Free Games',
            six: 'Patch Notes',
            nsfw: 'NSFW'
        }

        const reactions = [];
        for(const key in emojis){
            const emoji = getEmoji(key);
            reactions.push(emoji);
            text += `\n${emoji} -> "${emojis[key]}" text channel`
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
            if(user.id === '693061748374110218') return;

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
            if(reaction.message.channel.id === channelID) {
                handleReaction(reaction, user, true);
            }
        })
        
        client.on('messageReactionRemove', (reaction, user) => {
            if(reaction.message.channel.id === channelID) {
                handleReaction(reaction, user, false);
            }
        })
    }
    
}