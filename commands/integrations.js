import { MessageEmbed } from 'discord.js';
import wishlists from '../worker/wishlists.js';
import steamSchema from '../models/steamSchema.js';

const manageIntegrations = async interaction => {
    const subcommand = interaction.options.getSubcommand();

    const executeCommand = type => {
        const options = {
            'sync': () => syncIntegration(interaction),
            'import': () => addIntegration(interaction),
            'update': () => updateIntegration(interaction),
            'delete': () => deleteIntegration(interaction),
            'notifications': () => integrationNotifications(interaction)
        };
        return options[type]();
    };
    await executeCommand(subcommand);
}

const addIntegration = async interaction => {
    const url = interaction.options.getString('url');

    const steamIntegration = await steamSchema.find({ user: interaction.user.id });
    if(steamIntegration.length > 0) return interaction.reply({ content: 'You already have a Steam integration in place.', ephemeral: true });

    const steamProfile = url.match(/https?:\/\/steamcommunity\.com\/(profiles|id)\/([a-zA-Z0-9]+)/);
    if(!steamProfile) return interaction.reply({ content: 'Invalid Steam profile URL.', ephemeral: true });

    const [profile, type, user] = steamProfile;
    const wishlist = `https://store.steampowered.com/wishlist/${type}/${user}#sort=order`;

    const items = await wishlists.getItems(wishlist);
    if(items.error) return interaction.reply({ content: items.error, ephemeral: true });

    const integrationInfo = {
        profile: {
            url: profile
        },
        wishlist: {
            url: wishlist,
            items: items.map(item => ({ ...item, notified: false }))
        },
        notifications: true
    };

    await steamSchema.updateOne({ user: interaction.user.id }, { $set: integrationInfo }, { upsert: true });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam profile imported successfully!')
            .setColor('RANDOM')
    ], ephemeral: true });
}

const updateIntegration = async interaction => {
    const url = interaction.options.getString('url');

    const steamIntegration = await steamSchema.find({ user: interaction.user.id });
    if(steamIntegration.length === 0) return interaction.reply({ content: 'You don\'t have a Steam integration in place.', ephemeral: true });

    const steamProfile = url.match(/https?:\/\/steamcommunity\.com\/(profiles|id)\/([a-zA-Z0-9]+)/);
    if(!steamProfile) return interaction.reply({ content: 'Invalid Steam profile URL.', ephemeral: true });

    const [profile, type, user] = steamProfile;

    const integrationInfo = {
        'profile.url': profile,
        'wishlist.url': `https://store.steampowered.com/wishlist/${type}/${user}#sort=order`
    };

    await steamSchema.updateOne({ user: interaction.user.id }, { $set: integrationInfo });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam integration updated successfully!')
            .setColor('RANDOM')
    ], ephemeral: true });
}

const syncIntegration = async interaction => {
    const steamIntegration = await steamSchema.find({ user: interaction.user.id });
    if(steamIntegration.length === 0) return interaction.reply({ content: 'You don\'t have a Steam integration in place.', ephemeral: true });

    const items = await wishlists.getItems(steamIntegration[0].wishlist.url);
    if(items.error) return interaction.reply({ content: items.error, ephemeral: true });

    for(const item of items) {
        const game = steamIntegration[0].wishlist.items.find(element => element.name === item.name);
        item.notified = game?.notified || false;
    }

    await steamSchema.updateOne({ user: interaction.user.id }, { $set: { 'wishlist.items': items } });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam wishlist synced successfully!')
            .setColor('RANDOM')
    ], ephemeral: true });
}

const integrationNotifications = async interaction => {
    const option = interaction.options.getBoolean('option');
    
    const steamIntegration = await steamSchema.find({ user: interaction.user.id });
    if(steamIntegration.length === 0) return interaction.reply({ content: 'You don\'t have a Steam integration in place.', ephemeral: true });

    await steamSchema.updateOne({ user: interaction.user.id }, { $set: { notifications: option } });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`Steam integration notifications have been turned ${option ? 'on' : 'off'}!`)
            .setColor('RANDOM')
    ], ephemeral: true });
}

const deleteIntegration = async interaction => {
    const steamIntegration = await steamSchema.find({ user: interaction.user.id });
    if(steamIntegration.length === 0) return interaction.reply({ content: 'You don\'t have a Steam integration in place.', ephemeral: true });

    await steamSchema.deleteOne({ user: interaction.user.id });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle('Steam integration deleted successfully!')
            .setColor('RANDOM')
    ], ephemeral: true });
}

export default { manageIntegrations };