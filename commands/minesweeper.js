'use strict';
/*
Please make sure the following files exists under the specified diretory:
  - utility/Games.util.js
  - models/userSchema.js
*/

// Reference required dependencies
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { basename } = require('path');
const GraphemeSplitter = require('grapheme-splitter');
const _ = require('lodash');

// Load required local modules
const { checkDuplicateInstance, removeInstance } = require('../utility/Games.util.js');
const model = require('../models/userSchema.js');

// Build the command profile
const command = new SlashCommandBuilder()
.setName('minesweeper')
.setDescription('Generate a minesweeper board')

// Permissions
// Guild.roles.everyone.id refers to the @everyone role, which everybody has
const allowedPermissions = (Guild) => [{
    id: Guild.roles.everyone.id,
    type: 'ROLE',
    permission: true
}];

// Export executable
module.exports = {
    builder: command,
    permissions: allowedPermissions,
    execute: async (client, interaction) => {

    const isNotDuplicate = await checkDuplicateInstance(interaction, basename(__filename, '.js'));

    if (!isNotDuplicate){
        return;
    };

    const splitter = new GraphemeSplitter();
    const join = el => el.join('');
    const elements = _.shuffle([
        ...splitter.splitGraphemes('💥'.repeat(5)),
        ...splitter.splitGraphemes('1️⃣'.repeat(7)),
        ...splitter.splitGraphemes('2️⃣'.repeat(6)),
        ...splitter.splitGraphemes('3️⃣'.repeat(5)),
        ...splitter.splitGraphemes('4️⃣'.repeat(2)),
    ]);

    const components = _.chunk(elements, 5).map((chunk, parentIndex) => new MessageActionRow()
        .addComponents(
            chunk.map((element, childIndex) => new MessageButton()
                .setLabel('\u200b')
                .setCustomId((childIndex + (parentIndex * 5)).toString())
                .setStyle('SECONDARY')
            )
        )
    );

    let counter = 0;
    let currentComponentState = components;
    const highestScore = await model.find({}).sort({ 'minesweeper.gameStats.highestScore': -1 }).limit(1);
    const highestScoreUsername = await interaction.client.users.fetch(highestScore[0]._id)
        .then(user => user.tag)
        .catch(() => 'Unknown');

    const highestScorePoints = highestScore[0].gameStats.minesweeper.highestScore;

    let profile = await model.findByIdOrCreate(interaction.user.id).catch(e => e)

    if (profile instanceof Error){
        return interaction.reply({
            ephemeral: true,
            content: `❌ Error: ${profile.message}`
        });
    };

    const embed = new MessageEmbed()
      .setAuthor({ name: 'Minesweeper' })
      .setDescription('Click on the buttons below to reveal what their content is while evading the mines.')
      .addField('Current Score', counter.toString())
      .addField('High Score', `${highestScorePoints} (*${highestScoreUsername}*)`)
      .setColor('GREEN')
      .setFooter({ text: `You have played this game ${profile.gameStats.minesweeper.gamesPlayed} times.`});

      const message = await interaction.reply({
          components,
          embeds: [ embed ],
          fetchReply: true
      });

      const collector = message.createMessageComponentCollector({
          componentType: 'BUTTON',
          time: 60000
      });

      collector
      .on('collect', async i => {
          if (i.user.id !== interaction.user.id){
              return i.reply({
                  ephemeral: true,
                  content: `❌ This challenge is for **${interaction.member.displayName}**!`
              });
          };

          let revealedButton;

          const newComponents = message.components
              .map((row, parentIndex) => new MessageActionRow().addComponents(
                  row.components.map((button, childIndex) => {
                      const id = parseInt(i.customId) + 1;
                      const clicked = {
                          parentIndex: Math.floor((parseInt(i.customId)) / 5),
                          get childIndex(){ return (id - this.parentIndex * 5) - 1 }
                      };

                      function isBtn(){
                          return clicked.parentIndex === parentIndex && clicked.childIndex === childIndex;
                      };

                      revealedButton = elements[i.customId];

                      return new MessageButton(button)
                      .setStyle(isBtn()
                          ? revealedButton === '💥'
                              ? 'DANGER'
                              : 'SUCCESS'
                          : button.style
                      )
                      .setEmoji(isBtn()
                          ? revealedButton
                          : button.emoji
                      )
                      .setDisabled(isBtn()
                          ? true
                          : button.disabled
                      );
                  })
              )
          );

          currentComponentState = newComponents;

          if (revealedButton === '💥'){
            i.deferUpdate();
            return collector.stop();
          };

          const values = {
              '1️⃣': 1,
              '2️⃣': 2,
              '3️⃣': 3,
              '4️⃣': 4,
          };

          counter += values[revealedButton];

          if (!embed.fields.length){
              embed.addField('Current Score', counter.toString());
          } else {
              embed.spliceFields(0,1,{
                  name: 'Current Score',
                  value: counter.toString()
              });
          };

          if (counter > highestScorePoints){
              embed.spliceFields(1, 1, {
                  name: 'High Score',
                  value: `${counter} (*${interaction.user.tag}*)`
              })
          }

          i.update({
              embeds: [ embed ],
              components: newComponents
          });
      })
      .on('end', async () => {
          embed.setColor('RED');
          const response = {
              content: `⚔️ This challenge has ended!`,
              embeds: [ embed ],
              components: currentComponentState.map((row, parentIndex) => new MessageActionRow().addComponents(
                  row.components.map((button, childIndex) => new MessageButton(button)
                        .setEmoji(elements[childIndex + (parentIndex * 5)])
                        .setDisabled(true)
                  )
              ))
          };

          profile = await model.findByIdOrCreate(interaction.user.id).catch(e => e);

          if (profile instanceof Error){
              return interaction.editReply({
                  ephemeral: true,
                  content: `❌ Error ${profile.message}`
              });
          }

          profile.gameStats.minesweeper.gamesPlayed++;

          if (counter > profile.gameStats.minesweeper.highestScore){
              profile.gameStats.minesweeper.highestScore = counter;
          };
          return profile
          .save()
          .then(() => message.edit(response))
          .catch(e => message.edit({ content: `❌ Error: ${e.message}`}))
          .finally(() => removeInstance(interaction, basename(__filename, '.js')));
      });
    }
};
