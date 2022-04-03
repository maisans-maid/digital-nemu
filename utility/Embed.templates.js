'use strict';

const { MessageEmbed } = require('discord.js');

exports.errorLog = (options) => new MessageEmbed()
    .setColor('RED')
    .setAuthor({
        name: options.name || '❌ Error!'
    })
    .addFields([{
        name: 'Reason',
        value: options.reason || 'Unidentified'
    },{
        name: 'Suggested Fix',
        value: options.fix || 'Report this error directly to the developer'
    }]);
