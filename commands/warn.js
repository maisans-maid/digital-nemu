const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const model = require('../models/userSchema.js');

const command = new SlashCommandBuilder()
.setName('warn')
.setDescription('warn a user')
.addUserOption(option => option
    .setName('user')
    .setDescription('The user to warn')
    .setRequired(true)
)
.addStringOption(option => option
    .setName('reason')
    .setDescription('The reason for the warn')
)

const allowedPermissions = Guild => [{
    id: Guild.roles.cache.filter(x => x.permissions.any(['KICK_MEMBERS', 'BAN_MEMBERS'])),
    type: 'ROLE',
    permission: true
}];

module.exports = {
    builder: command,
    permissions: allowedPermissions,
    execute: async (client, interaction) => {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        if (!interaction.member.permissions.any(['KICK_MEMBERS', 'BAN_MEMBERS'])){
            return interaction.reply({
                ephemeral: true,
                content: '❌ You have no permission to kick members'
            });
        };

        if ((user.id === interaction.user.id) || user.bot){
            return interaction.reply({
                ephemeral: true,
                content: '❌ Invalid input!'
            });
        };

        const profile = await model.findByIdOrCreate(user.id).catch(e => e);

        if (profile instanceof Error){
            return interaction.reply({
                ephemeral: true,
                content: `❌ Error: ${profile.message}`
            });
        };

        const embed = new MessageEmbed()
            .setColor('GREY')
            .setAuthor({
                name: '⚠ Warn information'
            })
            .addFields([{
                name: 'Warned by:',
                value: interaction.user.tag
            },{
                name: 'Reason:',
                value: reason || 'Not provided.'
            }])
            .setFooter({
                text: `This user was already banned ${profile.warnings.length} times!`
            });

        const details = [{
            reportId: Date.now().toString(),
            content: reason || 'Not provided.',
            executorId: interaction.member.id
        }];

        profile.warnings.push(details);

        profile.save()
        .then(() => interaction.reply({
            content: `${user}, you had been warned!`,
            embeds: [ embed ]
        }))
        .catch(() => interaction.reply({
            content: `${user}, you had been warned!\n\nUnable to save data to database~`
        }));
    }
};
