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
const _ = require('lodash');
const TicTacToeEngine = require('tic-tac-toe-minimax-engine');
const { GameStatus, Player } = TicTacToeEngine;

// Load required local modules
const { checkDuplicateInstance, removeInstance } = require('../utility/Games.util.js');
const model = require('../models/userSchema.js');


// Build the command profile
const command = new SlashCommandBuilder()
.setName('tictactoe')
.setDescription('Generate a tictactoe board')

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

    const components = [
        new MessageActionRow().addComponents(
            new MessageButton()
            .setCustomId('0:0')
            .setStyle('SECONDARY')
            .setLabel('\u200b'),
            new MessageButton()
            .setCustomId('1:0')
            .setStyle('SECONDARY')
            .setLabel('\u200b'),
            new MessageButton()
            .setCustomId('2:0')
            .setStyle('SECONDARY')
            .setLabel('\u200b')
        ),
        new MessageActionRow().addComponents(
          new MessageButton()
          .setCustomId('0:1')
          .setStyle('SECONDARY')
          .setLabel('\u200b'),
          new MessageButton()
          .setCustomId('1:1')
          .setStyle('SECONDARY')
          .setLabel('\u200b'),
          new MessageButton()
          .setCustomId('2:1')
          .setStyle('SECONDARY')
          .setLabel('\u200b')
        ),
        new MessageActionRow().addComponents(
          new MessageButton()
          .setCustomId('0:2')
          .setStyle('SECONDARY')
          .setLabel('\u200b'),
          new MessageButton()
          .setCustomId('1:2')
          .setStyle('SECONDARY')
          .setLabel('\u200b'),
          new MessageButton()
          .setCustomId('2:2')
          .setStyle('SECONDARY')
          .setLabel('\u200b')
        ),
    ];

    const currentComponentState = components;
    const game = new TicTacToeEngine.default(Player.PLAYER_ONE);

    let profile = await model.findByIdOrCreate(interaction.user.id).catch(e => e)

    if (profile instanceof Error){
        return interaction.reply({
            ephemeral: true,
            content: `❌ Error: ${profile.message}`
        });
    };

    let win = profile.gameStats.tictactoe.won;
    let lose = profile.gameStats.tictactoe.lost;

    const embed = new MessageEmbed()
    .setAuthor({ name: 'Tic-Tac-Toe' })
    .setDescription('Click on the buttons below and try to defeat the almighty Digital Nemu!')
    .setFooter({ text: `Personal Win Rate: ${((win / (win + lose) || 0) * 100).toFixed(2)} % (${win}/${lose}) (W/L)` })
    .setColor('GREEN');

    let moveCounter = 0;
    let x;
    let y;
    let bestMove;
    let newComponents;

    const message = await interaction.reply({
        components,
        embeds: [ embed ],
        fetchReply: true
    });

    const collector = message.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 60000
    });

    let privateEnum;

    collector
    .on('collect', async i => {
        if (i.user.id !== interaction.user.id){
            return i.reply({
                ephemeral: true,
                content: `❌ This challenge is for **${interaction.member.displayName}**!`
            });
        };

        x = parseInt(i.customId.split(':')[0]);
        y = parseInt(i.customId.split(':')[1]);

        privateEnum = game.makeNextMove(x,y);

        if (privateEnum !== 5){
            i.deferUpdate();
            return collector.stop({ privateEnum, scope: 'USER'});
        };

        newComponents = generateComponent(moveCounter, message.components, x, y)

        bestMove = game.getBestMove();
        privateEnum = game.makeNextMove(bestMove.x, bestMove.y);

        moveCounter++;

        if (privateEnum !== 5){
            i.deferUpdate();
            return collector.stop({privateEnum, scope: 'CPU'});
        };

        i.update({ embeds: [ embed ], components: generateComponent(moveCounter, newComponents, bestMove.x, bestMove.y) });

        moveCounter++;
    })
    .on('end', async (_,winner) => {

        profile = await model.findByIdOrCreate(interaction.user.id).catch(e => e);

        if (profile instanceof Error){
            return interaction.editReply({
                ephemeral: true,
                content: `❌ Error ${profile.message}`
            });
        };

        profile.gameStats.tictactoe[winner.scope === 'USER' && winner.privateEnum !== 4 ? 'won' : 'lost']++;

        win = profile.gameStats.tictactoe.won;
        lose = profile.gameStats.tictactoe.lost;

        const response = {
            embeds: [ embed.setFooter({ text: `Personal Win Rate: ${((win / (win + lose) || 0) * 100).toFixed(2)} % (${win}/${lose}) (W/L)` }).setColor(winner.scope === 'USER' && winner.privateEnum !== 4 ? 'GREEN' : 'RED') ],
            components: generateComponent(moveCounter, winner.scope == 'USER' ? message.components : newComponents, winner.scope == 'USER' ? x : bestMove.x, winner.scope == 'USER' ? y : bestMove.y, true),
            content: `⚔️ This challenge has ended! You **${winner.scope === 'USER' ? winner.privateEnum !== 4 ? 'won' : 'tied' : 'lost'}**.`
        };

        return profile
        .save()
        .then(() => message.edit(response))
        .catch(e => message.edit({ content: `❌ Error: ${e.message}`}))
        .finally(() => removeInstance(interaction, basename(__filename, '.js')));
    })
  }
};

function generateComponent(moveCounter, components, x, y, end){
    return components.map((row, parentIndex) => new MessageActionRow().addComponents(
        row.components.map((button, childIndex) => {
            if (parentIndex != y){
                return new MessageButton(button).setDisabled(end ? true : button.disabled);
            };
            if (childIndex != x){
                return new MessageButton(button).setDisabled(end ? true : button.disabled);
            }
            return new MessageButton(button)
            .setStyle(moveCounter % 2 == 0 ? 'PRIMARY' : 'DANGER')
            .setLabel(moveCounter % 2 == 0 ? '✖' : '⭕')
            .setDisabled(true)
        })
    ));
};
