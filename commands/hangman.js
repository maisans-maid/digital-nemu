'use strict';
/*
Please make sure the following files exists under the specified diretory:
  - utility/Games.util.js
  - models/userSchema.js
*/

// Reference required dependencies
const { SlashCommandBuilder, codeBlock } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { basename } = require('path');
const _ = require('lodash');

// Load required local modules
const { checkDuplicateInstance, removeInstance } = require('../utility/Games.util.js');
const model = require('../models/userSchema.js');
const topics = require('../assets/json/hangman-word-bank.json');

const hangs = [
   '/---|\n|\n|\n|\n|',
   '/---|\n|   o\n|\n|\n|',
   '/---|\n|   o\n|   |\n|\n|',
   '/---|\n|   o\n|  /|\n|\n|',
   '/---|\n|   o\n|  /|\\\n|\n|',
   '/---|\n|   o\n|  /|\\\n|  /\n|',
   '/---|\n|   o ~ GAME OVER!\n|  /|\\\n|  / \\\n|'
];

const alphanumeric = {
    A: '🇦', B: '🇧', C: '🇨', D: '🇩',
    E: '🇪', F: '🇫', G: '🇬', H: '🇭',
    I: '🇮', J: '🇯', K: '🇰', L: '🇱',
    M: '🇲', N: '🇳', O: '🇴', P: '🇵',
    Q: '🇶', R: '🇷', S: '🇸', T: '🇹',
    U: '🇺', V: '🇻', W: '🇼', X: '🇽',
    Y: '🇾', Z: '🇿'
}

// Build the command profile
const command = new SlashCommandBuilder()
.setName('hangman')
.setDescription('Play hangman')

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
    execute: async (client, interaction) => {

        const isNotDuplicate = await checkDuplicateInstance(interaction, basename(__filename, '.js'));

        if (!isNotDuplicate){
            return;
        };

        let profile = await model.findByIdOrCreate(interaction.user.id).catch(e => e)

        if (profile instanceof Error){
            return interaction.reply({
                ephemeral: true,
                content: `❌ Error: ${profile.message}`
            });
        };

        const topic = topics[_.random(0, topics.length - 1)].toUpperCase();
        const correctLetters = [...new Set(topic)].filter(c => Object.keys(alphanumeric).includes(c));
        const randomLetters = _.shuffle(Object.keys(alphanumeric))
            .filter(c => !correctLetters.includes(c))
            .splice(0, 25 - correctLetters.length);
        const displayLetters = _.shuffle([
            ...correctLetters,
            ...randomLetters
        ]);

        let currentState = topic.replace(/[a-z]/ig, '_');
        let tries_remaining = 6;
        let victory = false;

        let won = profile.gameStats.hangman.won;
        let lost = profile.gameStats.hangman.lost;

        const embed = new MessageEmbed()
        .setColor('ORANGE')
        .addField(
            'Guess the Word!',
            codeBlock([...hangs].reverse()[tries_remaining]),
            true
        )
        .addField(
            'Tries Remaining',
            '🐱‍👤'.repeat(tries_remaining) || '\u200b',
            true
        )
        .addField(
            'Answer Field',
            codeBlock(currentState.split('').join(' '))
        )
        .setFooter({ text: `Personal Win Rate: ${((won / (won + lost)) * 100).toFixed(2)} % (${won}/${lost}) (W/L)` });

        let components = _.chunk(displayLetters, 5)
            .map(chunk => new MessageActionRow().addComponents(
                  chunk.map(letter => new MessageButton()
                      .setEmoji(alphanumeric[letter])
                      .setCustomId(letter)
                      .setStyle('SECONDARY')
                  )
            ));

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
          if (i.user.id !== interaction.user.id)
              return i.reply({
                  ephemeral: true,
                  content: 'This challenge is not for you!'
              });

          components = components
              .map(row => new MessageActionRow().addComponents(
                  row.components.map(button => new MessageButton(button)
                      .setStyle(button.customId === i.customId
                            ? topic.includes(i.customId)
                                ? 'SUCCESS'
                                : 'DANGER'
                            : button.style
                      )
                      .setDisabled(button.customId === i.customId
                            ? true
                            : button.disabled
                      )
                      .setEmoji(button.emoji)
                  )
              ));

          if (topic.includes(i.customId)){
              topic.split('')
              .forEach((letter, index) => {
                  if (letter === i.customId){
                      const splitted = currentState.split('');
                      splitted[index] = i.customId;
                      currentState = splitted.join('');
                  };
              });
          } else {
              tries_remaining --;
          };

          embed.spliceFields(0, 3, [
              {
                  name: embed.fields[0].name,
                  value: codeBlock([...hangs].reverse()[tries_remaining]),
                  inline: embed.fields[0].inline
              },
              {
                  name: embed.fields[1].name,
                  value: '🐱‍👤'.repeat(tries_remaining) || '\u200b',
                  inline: embed.fields[1].inline
              },
              {
                  name: embed.fields[2].name,
                  value: codeBlock(currentState.split('').join(' '))
              }
          ]);

          if (tries_remaining === 0){
              i.deferUpdate();
              return collector.stop('NO_MORE_TRIES');
          };

          if (!currentState.includes('_')){
              i.deferUpdate();
              victory = true;
              return collector.stop('COMPLETED');
          };

          collector.resetTimer({
              time: 60000
          });

          i.update({
              embeds: [ embed ],
              components
          })
      })
      .on('end', async (_, reason) => {

        const reasons = {
            NO_MORE_TRIES: '❌ You have no tries left!',
            COMPLETED: '🎉 You completed the puzzle!'
        };

        let profile = await model.findByIdOrCreate(interaction.user.id).catch(e => e)

        if (profile instanceof Error){
            return interaction.reply({
                ephemeral: true,
                content: `❌ Error: ${profile.message}`
            });
        };

        if (profile instanceof Error)
            return interaction.followUp({
                ephemeral: true,
                content: `❌ Error ${profile.message}`
            });

        let extra = '';

        if (!victory){
            profile.gameStats.hangman.lost++;
            embed.addField(
                'Correct Answer',
                codeBlock(topic.split('').join(' '))
            );
        } else {
          const credits = Math.ceil(topic.length * 1.25);
          const bonus = Math.ceil(credits * (tries_remaining * 0.15))

          profile.credits += Math.ceil(credits + bonus);
          profile.gameStats.hangman.won++;
        };

        won = profile.gameStats.hangman.won;
        lost = profile.gameStats.hangman.lost;

        profile
        .save()
        .then(() => message.edit({
            content: `⚔️ This challenge has ended! (${reasons[reason] || '⏳ You ran out of time!'})\n${extra}`,
            components: components.map(row => new MessageActionRow().addComponents(
                row.components.map(button => new MessageButton(button).setDisabled(true))
            )),
            embeds: [ embed.setColor(victory ? 'GREEN' : 'RED').setFooter({ text: `Personal Win Rate: ${(((won / (won + lost)) * 100) || 0).toFixed(2)} % (${won}/${lost}) (W/L)` }) ]
        }))
        .catch(e => interaction.followUp({
            ephemeral: true,
            content: `❌ Error: ${e.message}`
        }))
        .finally(() => removeInstance(interaction, basename(__filename, '.js')))
      })
  }
}
