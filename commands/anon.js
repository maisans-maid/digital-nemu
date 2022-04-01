const { SlashCommandBuilder } = require('@discordjs/builders');

const command = new SlashCommandBuilder()
.setName('anon')
.setDescription('Send an anonymous message on this channel.')
.addStringOption(option => option
    .setName('message')
    .setDescription('Content of the message.')
    .setRequired(true)
);

const allowedPermissions = (Guild) => [{
    id: Guild.roles.everyone.id,
    type: 'ROLE',
    permission: true
}];

module.exports = {
    builder: command,
    permissions: allowedPermissions,
    execute: async (client, interaction) => {

        const message = interaction.options.getString('message');
        const hook = await interaction.channel.createWebhook('Anonymous');

        await hook.send(message)
            .then(() => interaction.reply({ ephemeral: true, content: '✅ Message sent anonymously!'}))
            .catch(e => interaction.reply({ ephemeral: true, content: `❌ Message was not sent! ${e.message}`}));

        setTimeout(async function() {
            await hook.delete()
        }, 1000);
    }
}
