import { MessageEmbed } from 'discord.js';
import { getWebhook } from '../handlers/webhooks.js';
import settingsSchema from '../models/settingsSchema.js';

const manageWebhooks = async interaction => {
    const subcommand = interaction.options.getSubcommand();

    const executeCommand = type => {
        const options = {
            'create': () => createWebhook(interaction),
            'delete': () => deleteWebhook(interaction)
        };
        return options[type]();
    };
    await executeCommand(subcommand);
}

const getCategoryWebhookName = type => {
    const options = {
        1: 'NSFW',
        2: 'Memes',
        3: 'News, Rumours and Discussions',
        4: 'Reviews',
        5: 'Game Deals',
        6: 'Free Games',
        7: 'Xbox',
        8: 'Playstation',
        9: 'Nintendo',
        10: 'Anime',
        11: 'Manga'
    }
    return options[type];
}

const createWebhook = async interaction => {
    const category = interaction.options.getInteger('category');
    const channel = interaction.options.getChannel('channel');
    if(channel.type !== 'GUILD_TEXT') return interaction.reply({ content: 'Can\'t assign a webhook to a channel category.', ephemeral: true });

    const webhookName = getCategoryWebhookName(category);

    const settings = await settingsSchema.find({ guild: interaction.guild.id });
    const webhooks = settings[0]?.webhooks || [];

    const hasWebhook = webhooks.some(item => item.name === webhookName);
    if(hasWebhook) return interaction.reply({ content: 'Webhook has already been assigned to a text channel in this guild.', ephemeral: true });

    const webhook = await channel.createWebhook(webhookName);
    const { id, token, name } = webhook;

    webhooks.push({ id, token, name });

    await settingsSchema.updateOne({ guild: interaction.guild.id }, { $set: { webhooks } }, { upsert: true });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`${webhookName} webhook has been assigned to ${channel.name}.`)
            .setColor('RANDOM')
    ]});
}

const deleteWebhook = async interaction => {
    const category = interaction.options.getInteger('category');

    const webhookName = getCategoryWebhookName(category);

    const settings = await settingsSchema.find({ guild: interaction.guild.id });
    const webhooks = settings[0]?.webhooks || [];

    const hasWebhook = webhooks.some(item => item.name === webhookName);
    if(!hasWebhook) return interaction.reply({ content: 'Webhook is not assigned to a text channel in this guild.', ephemeral: true });

    const webhook = await getWebhook(interaction.client, interaction.guild, webhookName);
    await webhook.delete();

    const webhookIndex = webhooks.findIndex(item => item.name === webhookName);
    webhooks.splice(webhookIndex, 1);
    await settingsSchema.updateOne({ guild: interaction.guild.id }, { $set: { webhooks } });

    interaction.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`${webhookName} webhook has been deleted.`)
            .setColor('RANDOM')
    ]});
}

export default { manageWebhooks };