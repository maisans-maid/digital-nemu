const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Collection } = require('discord.js');
const moment = require('moment');

const model = require('../models/pollSchema.js');
const embedTemplate = require('../processes/poll/poll.embed.js');
const componentsTemplate = require('../processes/poll/poll.components.js');

const command = new SlashCommandBuilder()
.setName('poll')
.setDescription('Generate poll.')
.addStringOption(option => option
    .setName('topic')
    .setDescription('The topic of this poll')
    .setRequired(true)
)
.addStringOption(option => option.setName('option-1').setDescription('1st Option').setRequired(true))
.addStringOption(option => option.setName('option-2').setDescription('2nd Option').setRequired(true))
.addStringOption(option => option.setName('option-3').setDescription('3rd Option'))
.addStringOption(option => option.setName('option-4').setDescription('4th Option'))
.addStringOption(option => option.setName('option-5').setDescription('5th Option'))
.addStringOption(option => option.setName('option-6').setDescription('6th Option'))
.addStringOption(option => option.setName('option-7').setDescription('7th Option'))
.addStringOption(option => option.setName('option-8').setDescription('8th Option'))
.addStringOption(option => option.setName('option-9').setDescription('9th Option'))
.addStringOption(option => option.setName('option-10').setDescription('10th Option'))


const allowedPermissions = Guild => Guild.roles.cache
    .filter(role => role.permissions.has('MANAGE_MESSAGES'))
    .map(role => Object.assign({
        id: role.id,
        type: 'ROLE',
        permission: true,
    }, {}));

module.exports = {
    builder: command,
    permissions: allowedPermissions,
    execute: async (client, interaction) => {

        const pollDocument = new model({
            _id: Date.now().toString(),
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            authorId: interaction.member.id,
            topic: interaction.options.getString('topic')
        });

        for (let i = 1; i < 11; i++){
            const topic = interaction.options.getString(`option-${i}`);
            if (topic){
                pollDocument.addChoice(topic);
            };
        };

        const embed = await embedTemplate(pollDocument, interaction.member.user);
        const components = componentsTemplate(pollDocument);

        return interaction.channel.send({ embeds: [embed], components, fetchReply: true })
        .then(message => {
            pollDocument.messageId = message.id;
            return pollDocument.save();
        })
        .then(() => interaction.reply({ ephemeral: true, content: 'Poll successfully created!'}))
        .catch(err => interaction.reply({ ephemeral: true, content: `❌ Error: ${err.message}`}));

    }
}
