import { MessageActionRow, MessageEmbed, MessageSelectMenu } from 'discord.js';
import { worker } from '../handlers/worker.js';
import settingsSchema from '../models/settingsSchema.js';

const manageChannels = async interaction => {
    const subcommand = interaction.options.getSubcommand();

    const executeCommand = type => {
        const options = {
            'create': () => createChannel(interaction),
            'update': () => updateChannel(interaction),
            'delete': () => deleteChannel(interaction),
            'assign': () => assignMessageToChannel(interaction),
            'dissociate': () => dissociateMessageFromChannel(interaction)
        };
        return options[type]();
    };
    await executeCommand(subcommand);
}

const createChannel = async interaction => {
    const name = interaction.options.getString('name');
    const type = interaction.options.getInteger('type');
    const topic = interaction.options.getString('topic');
    const nsfw = interaction.options.getBoolean('nsfw');
    const userLimit = interaction.options.getInteger('limit');

    const getCategoryChannel = type => {
        const options = {
            1: 'GUILD_TEXT',
            2: 'GUILD_VOICE'
        }
        return options[type] || null;
    }
    const channelType = getCategoryChannel(type);
    if(!channelType) return interaction.reply({ content: 'Invalid channel type.', ephemeral: true });

    await interaction.guild.channels.create(name, {
        type: channelType,
        topic: topic || '',
        nsfw: Boolean(nsfw),
        userLimit
    });

    interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Channel ${name} has been created.`)
			.setColor('RANDOM')
	], ephemeral: true });
}

const updateChannel = async interaction => {
    const channel = interaction.options.getChannel('channel');
    const name = interaction.options.getString('name');
    const topic = interaction.options.getString('topic');
    const nsfw = interaction.options.getBoolean('nsfw');
    const userLimit = interaction.options.getInteger('limit');

    await channel.edit({
        name: name || channel.name,
        topic: topic || channel.topic,
        nsfw: nsfw || channel.nsfw,
        userLimit: userLimit || channel.userLimit
    });

    interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Channel ${channel.name} has been updated.`)
			.setColor('RANDOM')
	], ephemeral: true });
}

const deleteChannel = async interaction => {
    const channel = interaction.options.getChannel('channel');

    const deletedChannel = await channel.delete();

    interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Channel ${deletedChannel.name} has been deleted.`)
			.setColor('RANDOM')
	], ephemeral: true });
}

const assignMessageToChannel = async interaction => {
    const category = interaction.options.getInteger('category');

    const assignCategoryMessage = type => {
        const options = {
            1: () => assignRolesMessageToChannel(interaction),
            2: () => assignLeaderboardMessageToChannel(interaction)
        }
        return options[type]();
    }
    await assignCategoryMessage(category);
}

const assignRolesMessageToChannel = async interaction => {
    const channel = interaction.options.getChannel('channel');

    const roles = [...interaction.guild.roles.cache.values()].sort((a, b) => a.position - b.position);
    const options = roles.map(item => {
        if(item.id === interaction.guild.roles.everyone.id || item.tags) return;

        return { label: item.name, value: item.id };
    }).filter(Boolean);

    const selectMenu = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId('assignRolesMessage')
			.setPlaceholder('Nothing selected.')
            .setMaxValues(options.length)
			.addOptions(options)
	);

    interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle('Select which roles should be included in the roles message.')
			.setColor('RANDOM')
	], components: [selectMenu], ephemeral: true });

    const filter = filterInteraction => filterInteraction.customId === 'assignRolesMessage' && filterInteraction.user.id === interaction.user.id;
	const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', max: 1, time: 60 * 1000 * 5 });
	collector.on('end', async collected => {
        const collectedInteraction = collected.first();
        if(!collectedInteraction) return interaction.editReply({ content: 'Channel assign timeout.', embeds: [], components: [], ephemeral: true });

        await settingsSchema.updateOne({ guild: interaction.guild.id }, { $set: { 'roles.channel': channel.id, 'roles.options': collectedInteraction.values } }, { upsert: true });
        await worker.roles.createRolesMessage(interaction.client);

        collectedInteraction.update({ embeds: [
            new MessageEmbed()
                .setTitle(`Roles message has been assigned to ${channel.name}.`)
                .setColor('RANDOM')
        ], components: [], ephemeral: true });
	});
}

const assignLeaderboardMessageToChannel = async interaction => {
    const channel = interaction.options.getChannel('channel');

    const leaderboards = ['Steam'];
    const options = leaderboards.map(item => ({ label: item, value: item }));

    const selectMenu = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId('assignLeaderboardsMessage')
			.setPlaceholder('Nothing selected.')
            .setMaxValues(options.length)
			.addOptions(options)
	);

    interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle('Select which categories should be included in the leaderboards message.')
			.setColor('RANDOM')
	], components: [selectMenu], ephemeral: true });

    const filter = filterInteraction => filterInteraction.customId === 'assignLeaderboardsMessage' && filterInteraction.user.id === interaction.user.id;
	const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', max: 1, time: 60 * 1000 * 5 });
	collector.on('end', async collected => {
        const collectedInteraction = collected.first();
        if(!collectedInteraction) return interaction.editReply({ content: 'Channel assign timeout.', embeds: [], components: [], ephemeral: true });

        for(const leaderboard of collectedInteraction.values) {
            if(leaderboard === 'Steam') await settingsSchema.updateOne({ guild: interaction.guild.id }, { $set: { 'leaderboards.steam.channel': channel.id } }, { upsert: true });
        }

        collectedInteraction.update({ embeds: [
            new MessageEmbed()
                .setTitle(`Leaderboard message has been assigned to ${channel.name}.`)
                .setColor('RANDOM')
        ], components: [] });
	});
}

const dissociateMessageFromChannel = async interaction => {
    const category = interaction.options.getInteger('category');

    const dissociateCategoryMessage = type => {
        const options = {
            1: () => dissociateRolesMessageFromChannel(interaction),
            2: () => dissociateLeaderboardMessageFromChannel(interaction)
        }
        return options[type]();
    }
    await dissociateCategoryMessage(category);
}

const dissociateRolesMessageFromChannel = async interaction => {
    const channel = interaction.options.getChannel('channel');

    const settings = await settingsSchema.find({ guild: interaction.guild.id });
    const rolesChannel = settings[0]?.roles?.channel
    if(rolesChannel === channel.id) return interaction.reply({ content: `Channel ${channel.name} doesn\'t have a roles message assigned.`, ephemeral: true });

    await settingsSchema.updateOne({ guild: interaction.guild.id }, { $set: { 'roles.channel': null } });

    interaction.reply({ embeds: [
		new MessageEmbed()
                .setTitle(`Roles message has been dissociated from ${channel.name}.`)
                .setColor('RANDOM')
	]});
}

const dissociateLeaderboardMessageFromChannel = async interaction => {
    const channel = interaction.options.getChannel('channel');

    const leaderboards = ['Steam'];
    const options = leaderboards.map(item => ({ label: item, value: item }));

    const selectMenu = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId('dissociateLeaderboardMessage')
			.setPlaceholder('Nothing selected.')
            .setMaxValues(options.length)
			.addOptions(options)
	);

    interaction.reply({ embeds: [
		new MessageEmbed()
			.setTitle(`Select which categories should be excluded from the leaderboards message in channel ${channel.name}.`)
			.setColor('RANDOM')
	], components: [selectMenu], ephemeral: true });

    const filter = filterInteraction => filterInteraction.customId === 'dissociateLeaderboardMessage' && filterInteraction.user.id === interaction.user.id;
	const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', max: 1, time: 60 * 1000 * 5 });
	collector.on('end', async collected => {
        const collectedInteraction = collected.first();
        if(!collectedInteraction) return interaction.editReply({ content: 'Channel dissociate timeout.', embeds: [], components: [], ephemeral: true });

        for(const leaderboard of collectedInteraction.values) {
            if(leaderboard === 'Steam') await settingsSchema.updateOne({ guild: interaction.guild.id }, { $set: { 'leaderboards.steam.channel': null } });
        }

        collectedInteraction.update({ embeds: [
            new MessageEmbed()
                .setTitle(`Leaderboard message has been dissociated from ${channel.name}.`)
                .setColor('RANDOM')
        ], components: [] });
	});
}

export default { manageChannels };