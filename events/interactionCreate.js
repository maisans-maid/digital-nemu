'use strict';

const handleTicket = require('../processes/ticket-tool/handles/handle.main.js')
const handlePoll = require('../processes/poll/poll.handle.js');

module.exports = (client, interaction) => {
    if (interaction.isCommand()){
        const commandExecutable = client.custom.commands.get(interaction.commandName);

        if (!commandExecutable){
            return interaction.reply({
                ephemeral: true,
                content: `**${interaction.commandName}** has none or has missing command module.`
            });
        };

        try {
            commandExecutable(client, interaction);
        } catch (e) {
            const errorMessage = {
                ephemeral: true,
                content: `❌ Error: ${e.message}`
            };
            if (interaction.deferred || interaction.replied){
                return interaction.editReply(errorMessage);
            } else {
                return interaction.reply(errorMessage);
            };
        };
    };

    if (interaction.isButton()){
        handleTicket(interaction);
        handlePoll(interaction);
    };
};
