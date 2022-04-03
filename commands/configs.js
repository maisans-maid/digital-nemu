const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const model = require('../models/guildSchema.js');

const command = new SlashCommandBuilder()
.setName('configs')
.setDescription('Display this server\'s configuration');

const allowedPermissions = Guild => Guild.roles.cache
    .filter(role => role.permissions.has('MANAGE_GUILD'))
    .map(role => Object.assign({
        id: role.id,
        type: 'ROLE',
        permission: true,
    }, {}));

module.exports = {
    builder: command,
    permissions: allowedPermissions,
    execute: async (client, interaction) => {

        const profile = await model.findByIdOrCreate(interaction.guildId).catch(e => e);
        if (profile instanceof Error){
            return interaction.reply({
                ephemeral: true,
                content: `❌ Error: ${profile.message}`
            });
        };

        function getChannel(id){
            return interaction.guild.channels.cache.get(id)?.toString() || '*Not set*';
        };

        function getRole(id){
            return interaction.guild.roles.cache.get(id)?.toString() || '*Not set*';
        };

        return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setDescription('\u200b\n')
                .setTimestamp()
                .setAuthor({
                    name: `${interaction.guild.me.displayName}'s Server Configuration for ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL()
                })
                .setColor('#daa6ff')
                .addFields([
                    {
                        name: '<:NemuriOwO:858178373482053653> Channel Configuration',
                        value: [
                             `-\u2000 **Deleted Messages Archive**: ${getChannel(profile.channels.clearMessages)}`,
                             `-\u2000 **Levelup Notifications**: ${getChannel(profile.channels.levelUp)}`,
                             `-\u2000 **Support Category Channel**: ${getChannel(profile.channels.supportCategoryId)}`,
                             `-\u2000 **System (Bot) Logs** *(Recommended)*: ${getChannel(profile.channels.logger)}`,
                             `-\u2000 **Verification Channel**: ${getChannel(profile.channels.verification)}`,
                             `-\u2000 **Welcome Greeter Chanel**: ${getChannel(profile.channels.welcome)}`,
                             '*These can be reconfigured via the `\setchannel` command*'
                        ].join('\n'),
                    },
                    {
                        name: '<:NemuriUwU:858178289117691915>  Role Configuration',
                        value: [
                            `-\u2000 **Verification Role**: ${getRole(profile.roles.verification)}`,
                            '*These can be reconfigured via the `\setrole` command*'
                        ].join('\n'),
                    },
                    {
                        name: '<:NemuSparkle:939476271119859752>  Default Text Configuration',
                        value: [
                            `-\u2000 **Welcome Greeter Text**: ${profile.text.welcome || '*Unset*'}`,
                            '*These can be reconfigured via the `\setdefaulttext` command*'
                        ].join('\n'),
                    },
                    {
                        name: '<:LunaSailor:858303938741665794> Level Role Rewards',
                        value: profile.levelRewards.map(x => `Level **${x.level}** = ${getRole(x.role)}`).join('\n') || '*No rewards has been configured for this server*.'
                    },
                    {
                        name: '<:NemuSHEEESH:925395147045347359> Support Reasons',
                        value: [
                            profile.supportReasons.map(x => `-\u2000 ${x}`).join('\n') || '*Unset*',
                            '*These can be reconfigured via the `\setupticketsupport` command*'
                        ].join('\n')
                    },
                ])
            ]
        })

    }
}
