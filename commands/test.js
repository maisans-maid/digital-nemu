const { SlashCommandBuilder } = require('@discordjs/builders');

const command = new SlashCommandBuilder()
.setName('test')
.setDescription('Manually trigger various automated bot tasks/events')
.addStringOption(option => option
    .setName('task')
    .setDescription('Task to trigger')
    .addChoices([
        [ 'Welcome Message', 'event#guildMemberAdd' ],
    ])
);


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

        const action = interaction.options.getString('task');

        if (action === 'event#guildMemberAdd'){
            client.emit('guildMemberAdd', interaction.member);
            return interaction.reply({
                ephemeral: true,
                content: 'The task was successfully triggered!'
            });
        };
    }
}
