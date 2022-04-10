'use strict';

const _ = require('lodash');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = PollDocument => {
    const buttons = PollDocument.choices.map((choice, index) => {
        return new MessageButton()
        .setLabel(`${index + 1}`)
        .setStyle('SECONDARY')
        .setCustomId(`POLL:${PollDocument._id}:${choice.id}`)
    });

    const votationControls = _.chunk(buttons, 5).map(chunk => new MessageActionRow().addComponents(chunk));
    const authorControls = new MessageActionRow()
        .addComponents([
            new MessageButton()
            .setLabel('Move To Most Recent')
            .setEmoji('🔽')
            .setStyle('PRIMARY')
            .setCustomId(`POLL:${PollDocument._id}:RECENT`),
            new MessageButton()
            .setLabel('End Poll')
            .setEmoji('🔻')
            .setStyle('DANGER')
            .setCustomId(`POLL:${PollDocument._id}:END`)
        ]);

    return [ ...votationControls, authorControls ];
};
