'use strict';

const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildSchemaPartial } = require('../utility/Typedefs.js');

const model = require('../models/guildSchema.js');

const command = new SlashCommandBuilder()
.setName('setchannel')
.setDescription('Sets the various channel configurations for this server.')
.addSubcommand(subcommand => subcommand
    .setName('clearmessage')
    .setDescription('Set the selected channel as file dump for message history (make sure the channel is private).')
    .addChannelOption(option => option
        .setName('text-channel')
        .setDescription('The text channel to use. Leave blank to remove channel.')
    )
)
.addSubcommand(subcommand => subcommand
    .setName('levelup')
    .setDescription('Set the selected channel to send a levelup notification for all members')
    .addChannelOption(option => option
        .setName('text-channel')
        .setDescription('The text channel to use. Leave blank to remove channel.')
    )
)
.addSubcommand(subcommand => subcommand
    .setName('logger')
    .setDescription('Set the selected channel to send a message for sending audit logs.')
    .addChannelOption(option => option
        .setName('text-channel')
        .setDescription('The text channel to use. Leave blank to remove channel.')
    )
)
.addSubcommand(subcommand => subcommand
    .setName('verify')
    .setDescription('Set the selected channel as verification channel.')
    .addChannelOption(option => option
        .setName('text-channel')
        .setDescription('The text channel to use. Leave blank to remove channel.')
    )
)
.addSubcommand(subcommand => subcommand
    .setName('welcomemessage')
    .setDescription('Set the selected channel to send a message everytime a member joins this server.')
    .addChannelOption(option => option
        .setName('text-channel')
        .setDescription('The text channel to use. Leave blank to remove channel.')
    )
)

const allowedPermissions = (Guild) => Guild.roles.cache
    .filter(role => role.permissions.has('MANAGE_GUILD'))
    .map(role => Object.assign({},{
        id: role.id,
        type: 'ROLE',
        permission: true
    }));

module.exports = {
    builder: command,
    permissions: allowedPermissions,
    execute: async (client, interaction) => {

        if (!interaction.member.permissions.has('MANAGE_GUILD')){
            return interaction.reply({
                ephemeral: true,
                content: '❌ You have no permission to manage this server!'
            });
        };

        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('text-channel');

        if (channel && !channel.isText()){
            return interaction.reply({
                ephemeral: true,
                content: '❌ The selected channel is not a `text-channel`!'
            });
        };

        const profile = await model.findByIdOrCreate(interaction.guildId).catch(e => e);

        if (profile instanceof Error){
            return interaction.reply({
                ephemeral: true,
                content: `❌ Error: ${profile.message}`
            });
        };

        let response;

        if (subcommand === 'clearmessage'){
            profile.channels.clearMessages = channel ? channel.id : null;
            if (profile.channels.clearMessages === null){
                response = '✅ Successfully disabled clearmessage history upload feature.'
            } else {
                response = `✅ Deleted message history will now be archived at ${channel}!`
                if (!channel.permissionsFor(client.user).has(['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'])){
                    response += '\n⚠ Please make sure my **View Channel, Send Messages, **and **Attach Files** Permissions are enabled on that channel!'
                };
            };
        };

        if (subcommand === 'welcomemessage'){
            profile.channels.welcome = channel ? channel.id : null;
            if (profile.channels.welcome === null){
                response = '✅ Successfully disabled the welcome message feature.'
            } else {
                response = '✅ Successfully enabled the welcome message feature.'
                if (!channel.permissionsFor(client.user).has(['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'])){
                    response += '\n⚠ Please make sure my **View Channel, Send Messages, **and **Attach Files** Permissions are enabled on that channel!'
                };
            };
        };

        if (subcommand === 'levelup'){
            profile.channels.levelUp = channel ? channel.id : null;
            if (profile.channels.levelUp === null){
                response = '✅ Successfully disabled the levelup notification.'
            } else {
                response = `✅ Users that level up will be notified at ${channel}.`
                if (!channel.permissionsFor(client.user).has(['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'])){
                    response += '\n⚠ Please make sure my **View Channel, Send Messages, **and **Attach Files** Permissions are enabled on that channel!'
                };
            };
        };

        if (subcommand === 'logger'){
            profile.channels.logger = channel ? channel.id : null;
            client.custom.cache.guildSchemaPartials.set(interaction.guildId, new guildSchemaPartial(interaction.guild, profile));
            if (profile.channels.logger === null){
                response = '✅ Successfully disabled the audit-logging feature.'
            } else {
                response = `✅ Important logs will be displayed at ${channel}.`
                if (!channel.permissionsFor(client.user).has(['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'EMBED_LINKS'])){
                    response += '\n⚠ Please make sure my **View Channel, Send Messages, Attach Files, **and **Embed Links** Permissions are enabled on that channel!'
                };
            };
        };

        if (subcommand === 'verify'){
            profile.channels.verification = channel?.id || null;
            client.custom.cache.guildSchemaPartials.set(interaction.guildId, new guildSchemaPartial(interaction.guild, profile));
            if (profile.channels.verification === null){
                response = '✅ Successfully disabled the verification feature.'
            } else {
                response = `✅ Reading verification requests at ${channel}! While this is on, any messages sent on that channel will be automatically deleted.`
                if (!channel.permissionsFor(client.user).has(['VIEW_CHANNEL', 'MANAGE_MESSAGES'])){
                    response += '\n⚠ Please make sure my **View Channel** and **Manage Messages** Permission is enabled on that channel!'
                };
                if (!interaction.guild.roles.cache.get(profile.roles.verification)){
                    response += '\n⚠ Verification role not set! Please set a verification role!'
                };
            };
        };

        return profile.save()
        .then(() => interaction.reply({
            content: response,
            ephemeral: true
        }))
        .catch(err => interaction.reply({
            content: `❌ Oops! Something went wrong: ${err.message}`
        }));
    }
};
