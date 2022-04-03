'use strict';

const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildSchemaPartial } = require('../utility/Typedefs.js');

const model = require('../models/guildSchema.js');

const command = new SlashCommandBuilder()
.setName('setrole')
.setDescription('Sets the various channel configurations for this server.')
.addSubcommand(subcommand => subcommand
    .setName('verify')
    .setDescription('Set the selected role as the verification role')
    .addRoleOption(option => option
        .setName('role')
        .setDescription('The role to use. Leave blank to remove role.')
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
        const role = interaction.options.getRole('role');

        const profile = await model.findByIdOrCreate(interaction.guildId).catch(e => e);

        if (profile instanceof Error){
            return interaction.reply({
                ephemeral: true,
                content: `❌ Error: ${profile.message}`
            });
        };

        let response;

        if (subcommand === 'verify'){
            profile.roles.verification = role ? role.id : null;
            client.custom.cache.guildSchemaPartials.set(interaction.guildId, new guildSchemaPartial(interaction.guild, profile));
            if (profile.roles.verification === null){
                response = '✅ Successfully removed verification role.'
            } else {
                response = `✅ ${role} is now the new verification role!`
                const channel = interaction.guild.channels.cache.get(profile.channels.verification);
                if (!channel){
                    response += '\n⚠ Verification channel has not been set. Please set the verification channel through the `\setchannel` command.'
                } else if (!channel.permissionsFor(client.user).has(['VIEW_CHANNEL'])) {
                    response += '\n⚠ Please make sure my **View Channel, Send Messages, **and **Attach Files** Permissions are enabled on that channel!';
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
