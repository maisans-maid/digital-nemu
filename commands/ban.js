const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const command = new SlashCommandBuilder()
.setName('ban')
.setDescription('Ban a user')
.addUserOption(option => option
    .setName('user')
    .setDescription('The user to ban')
    .setRequired(true)
)
.addIntegerOption(option => option
    .setName('days')
    .setDescription('Ban for how many days')
)
.addStringOption(option => option
    .setName('reason')
    .setDescription('The reason for this ban')
)

const allowedPermissions = Guild => Guild.roles.cache
    .filter(role => role.permissions.has('BAN_MEMBERS'))
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
        const days = interaction.options.getInteger('days') || 0;
        const reason = interaction.options.getString('reason');

        if (!interaction.member.permissions.has('BAN_MEMBERS')){
            return interaction.reply({
                ephemeral: true,
                content: '❌ You have no permission to ban members'
            });
        };

        const member = await interaction.guild.members.fetch(user.id);

        if (!member.bannable){
            return interaction.reply({
                ephemeral: true,
                content: '❌ I cannot ban the selected user!'
            });
        };

        const banned = await member.ban({ days, reason }).catch(e => e);

        if (banned instanceof Error){
            return interaction.reply({
                ephemeral: true,
                content: `❌ An Error occured while banning ${member}! - ${banned.message}`
            });
        };

        return interaction.reply({
            content: `🔨 Successfully banned ${member}!`
        });
    }
};
