'use strict';

const handleWcMsg = require('../utility/Canvas.welcome.js');
const model = require('../models/guildSchema.js');
const moment = require('moment');

module.exports = async (client, guildMember) => {

    const guildProfile = await model.findByIdOrCreate(guildMember.id).catch(e => e);
    if (guildProfile instanceof Error){
        return;
    };

    const channel = guildMember.guild.channels.cache.get(guildProfile.channels.welcome || '896884423847456778');
    if (!channel || !channel.permissionsFor(client.user).has('VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES')){
        return //console.log('Channel not found or Insuffecient Permissions @ Canvas.welcome');
    };

    const text = guildProfile.text.welcome;

    handleWcMsg(guildMember, channel, modify(text, guildMember));
};


function modify(str, member){
    const modifiers = {
        // User Based
        "{user}"                : member.user.toString(),     // Mention format of the newly joined user (@Sakurajimai)
        "{username}"            : member.user.username,       // The username of the newly joined user (Sakurajimai)
        "{tag}"                 : member.user.tag,            // The username and discriminator of the newly joined user (Sakurajimai#6742)
        "{discriminator}"       : member.user.discriminator,  // The discriminator of the newly joined user (6742)
        "{nickname}"            : member.displayName,         // The nickname of the newly joined user (Wen, [at most cases, this is default on initial server join])

        // User Display Avatar
        "{avatar}"              : member.user.displayAvatarURL(),                                  // If avatar is animated, use only a frame.
        "{avatarDynamic}"       : member.user.displayAvatarURL({ dynamic: true, format: 'png'}),   // Display the animated avatar if it is animated.

        // User Info
        "{createdAt}"           : member.user.createdAt,
        "{createdAtMDY}"        : moment(member.user.createdAt).format('dddd, MMMM D YYYY'),  // The date for which the user account was creadted in a human-readable format

        // Server Channels
        "{channelCount}"        : member.guild.channels.cache.size,                                     // Number of all channels (including voice and category)
        "{categoryChannelCount}": member.guild.channels.cache.filter( c => c.type === 'category').size, // Number of category channels
        "{textChannelCount}"    : member.guild.channels.cache.filter( c => c.type === 'text'    ).size, // Number of Text channels
        "{voiceChannelCount}"   : member.guild.channels.cache.filter( c => c.type === 'voice'   ).size, // Number of Voice channels

        // Server Info
        "{serverIcon}"           : member.guild.iconURL(),                               // Display a static icon even if server icon is animated
        "{serverIconDynamic}"    : member.guild.iconURL({dynamic: true, format: 'png'}), // Display animated icon if server icon is animated
        "{serverName}"           : member.guild.name,                                    // The name of the server
        "{memberCount}"          : member.guild.memberCount,                             // The number of users this server currently have
        "{memberCountOrdinalized}": ordinalize(member.guild.memberCount)            // the number of users in ordinalized format (1st, 11th, 23rd, etc.)
    };
    return typeof str === 'string'
        ? str.replace(new RegExp(
              Object.keys(modifiers).join('|'),
              'g'
            ), word => modifiers[word] || word)
        : str;
};

function ordinalize(n = 0){
    return Number(n)+[,'st','nd','rd'][n/10%10^1&&n%10]||Number(n)+'th';
};
