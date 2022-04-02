'use strict';

const { SlashCommandBuilder } = require('@discordjs/builders');

const model = require('../models/guildSchema.js');

const command = new SlashCommandBuilder()
.setName('setdefaulttext')
.setDescription('Set the various text configurations for this server.')
.addSubcommand(subcommand => subcommand
    .setName('welcome-message')
    .setDescription('Sets the provided text as the welcome-message content.')
    .addStringOption(option => option
        .setName('message')
        .setDescription('The message to use. Leave blank to remove text')
    )
);

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
        const content = interaction.options.getString('message');

        const profile = await model.findByIdOrCreate(interaction.guildId).catch(e => e);

        if (profile instanceof Error){
            return interaction.reply({
                ephemeral: true,
                content: `❌ Error: ${profile.message}`
            });
        };

        let response;

        if (subcommand === 'welcomemessage'){
            profile.text.welcome = content || null;
            if (profile.text.welcome === null){
                response = '✅ Successfully removed the text for welcome messages!';
            } else {
                response = `✅ Successfully added text for welcome messages!`;
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
