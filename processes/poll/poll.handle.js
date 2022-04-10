'use strict';

const _ = require('lodash');
const { MessageActionRow, MessageButton } = require('discord.js');
const model = require('../../models/pollSchema.js');
const embedTemplate = require('./poll.embed.js');
const componentsTemplate = require('./poll.components.js');

module.exports = async interaction => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('POLL')) return;

    const pollId = interaction.customId.split(':')[1];
    const choiceId = interaction.customId.split(':')[2];

    const pollDocument = await model.findById(pollId);

    const pollChannel = interaction.guild.channels.cache.get(pollDocument.channelId);

    if (choiceId === 'RECENT'){
      if (interaction.member.id !== pollDocument.authorId){
          return interaction.reply({
              ephemeral: true,
              content: '❌ You cannot control this poll'
          });

      };
        await interaction.message.delete();
        return interaction.channel.send({
            embeds: interaction.message.embeds,
            components: interaction.message.components
        });
    };

    if (choiceId === 'END'){
        if (interaction.member.id !== pollDocument.authorId){
            return interaction.reply({
                ephemeral: true,
                content: '❌ You cannot control this poll'
            });
        };

        const components_ = interaction.message.components.map(ActionRow => new MessageActionRow().addComponents(
            ActionRow.components.map(Button =>
                Button.customId.split(':').pop() === 'RECENT'
                    ? new MessageButton(Button)
                    : new MessageButton(Button).setDisabled(true)
            )
        ));
        return interaction.update({
            embeds: interaction.embeds,
            components: components_
        });
    };

    pollDocument.addVote({ choiceId, userId: interaction.member.id });

    const embed = await embedTemplate(pollDocument, interaction.user);
    const components = componentsTemplate(pollDocument);

    return interaction.update({
        embeds: [ embed ],
        components
    })
    .then(() => pollDocument.save())
    .catch(err => interaction.reply({
        ephemeral: true,
        content: `❌ Error: ${err.message}`
    }));

};
