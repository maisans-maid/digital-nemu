const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { join } = require('path');
const _ = require('lodash');

const command = new SlashCommandBuilder()
.setName('8nemu')
.setDescription('Ask a yes or no question.')
.addStringOption(option => option
    .setName('query')
    .setDescription('What would you like to ask? (Answerable only by yes/no)')
    .setRequired(true)
)

const allowedPermissions = (Guild) => [{
    id: Guild.roles.everyone.id,
    type: 'ROLE',
    permission: true
}];

const responses = [
  '- yes pi opo',
  '- ok lang yan, mabit ka naman',
  '- UwU, no.',
  '- hell nAuR',
  '- tanong mo sa pagong.',
  '- ask me later, nagtwetwerk pa ako',
  '- prolly mga bHi3',
  '- yUuUuUH 😎👌🏻',
  '- basta heh'
]

module.exports = {
    builder: command,
    permissions: allowedPermissions,
    execute: async (client, interaction) => {
        const query = interaction.options.getString('query');
        const embed = new MessageEmbed()
        .setAuthor({ name: query})
        .setDescription(`> *${responses[_.random(0, responses.length - 1)]}*`)
        .setColor('ORANGE');

        return interaction.reply({ embeds: [ embed ]});
    }
}
