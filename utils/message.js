const erase = (message, timeout) => {
    if(message.channel.type === 'dm') return;
    setTimeout(() => message.delete(), timeout);
}

export { erase };