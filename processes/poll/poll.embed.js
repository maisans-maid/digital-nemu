'use strict';

const { MessageEmbed } = require('discord.js');

module.exports = async (pollDocument, user) => {

    const author = await user.client.users.fetch(pollDocument.authorId).catch(() => user.client.user);
    const total = pollDocument.totalVotes();
    const createProgressBar = (choice, total) => {
        const emojis = [
            '',
            '<:1:960505432709935125>',
            '<:2:960505432777035776>',
            '<:3:960505432709931009>',
            '<:4:960505432496042065>',
            '<:5:960505432827375626>',
            '<:6:960505432965791824>',
            '<:7:960505433049686057>',
            '<:8:960505432714129419>',
            '<:9:960505432873521152>',
            '<:10:960505432718327868>'
        ];
        const percentage = Math.floor(choice.voters.length / total * 100) || 0;
        const tens = Math.floor(percentage / 10);
        const remainder = percentage % 10;

        return `${emojis[10].repeat(tens)}${emojis[remainder]} *(${percentage}%)*`
    };

    const embed = new MessageEmbed()
        .setColor('#daa6ff')
        .setTitle(pollDocument.topic)
        .setAuthor({
            name: author.username,
            iconURL: author.displayAvatarURL()
        })
        .addFields(pollDocument.choices.map((choice, index) => {
            return {
                name: `[${index + 1}] ${choice.topic}`,
                value: createProgressBar(choice, total)
            };
        }))
        .setTimestamp(pollDocument.timestamp);

    if (total < 5){
        embed.setFooter({
            text: `This poll currently has ${total} total votes.`,
        });
    } else {
        embed.setFooter({
            text: `${user.username} and ${total - 1} other(s) have voted.`,
            iconURL: user.displayAvatarURL()
        })
    };

    return embed;
};
