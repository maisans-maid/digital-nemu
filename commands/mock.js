const { SlashCommandBuilder } = require('@discordjs/builders');

const command = new SlashCommandBuilder()
.setName('mock')
.setDescription('Mocks the provided user with your text!')
.addUserOption(option => option
    .setName('user')
    .setDescription('The user to mock')
    .setRequired(true)
)
.addStringOption(option => option
    .setName('message')
    .setDescription('Content of the message.')
    .setRequired(true)
);

const allowedPermissions = Guild => Guild.roles.cache
    .filter(role => role.permissions.has('MANAGE_WEBHOOKS'))
    .map(role => Object.assign({
        id: role.id,
        type: 'ROLE',
        permission: true,
    }, {}));

module.exports = {
    builder: command,
    permissions: allowedPermissions,
    execute: async (client, interaction) => {

        const message = interaction.options.getString('message');
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);
        const hook = await interaction.channel.createWebhook(member.displayName, {
            avatar: member.user.displayAvatarURL({ size: 1024 })
        });

        await hook.send(message)
            .then(() => interaction.reply({ ephemeral: true, content: '✅ Message sent!'}))
            .catch(e => interaction.reply({ ephemeral: true, content: `❌ Message was not sent! ${e.message}`}));

        setTimeout(async function() {
            await hook.delete()
        }, 1000);
    }
}
