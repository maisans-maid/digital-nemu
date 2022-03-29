const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const command = new SlashCommandBuilder()
.setName('kick')
.setDescription('kick a user')
.addUserOption(option => option
    .setName('user')
    .setDescription('The user to kick')
    .setRequired(true)
)
.addStringOption(option => option
    .setName('reason')
    .setDescription('The reason for this kick')
)

const allowedPermissions = Guild => Guild.roles.cache
    .filter(role => role.permissions.has('KICK_MEMBERS'))
    .map(role => Object.assign({
        id: role.id,
        type: 'ROLE',
        permission: true,
    }, {}));


module.exports = {
    builder: command,
    permissions: allowedPermissions,
    execute: async (client, interaction) => {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        if (!interaction.member.permissions.has('KICK_MEMBERS')){
            return interaction.reply({
                ephemeral: true,
                content: '❌ You have no permission to kick members'
            });
        };

        const member = await interaction.guild.members.fetch(user.id);

        if (!member.kickable){
            return interaction.reply({
                ephemeral: true,
                content: '❌ I cannot kick the selected user!'
            });
        };

        const kicked = await member.kick(reason).catch(e => e);

        if (kicked instanceof Error){
            return interaction.reply({
                ephemeral: true,
                content: `❌ An Error occured while kicking ${member}! - ${banned.message}`
            });
        };

        return interaction.reply({
            content: `🦶 Successfully kicked ${member}!`
        });
    }
};
