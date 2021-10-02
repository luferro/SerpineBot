module.exports = {
    erase(message, timeout) {
        if(message.channel.type === 'dm') return;
        message.delete({ timeout });
    }
}