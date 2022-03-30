'use strict';

const handleWcMsg = require('../utility/Canvas.welcome.js');
const model = require('../models/guildSchema.js');

module.exports = async (client, guildMember) => {

    const guildProfile = await model.findByIdOrCreate(guildMember.id).catch(e => e);
    if (guildProfile instanceof Error){
        return;
    };

    const channel = guildMember.guild.channels.cache.get(guildProfile.channels.welcome || '896884423847456778');
    if (!channel || !channel.permissionsFor(client.user).has('VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES')){
        return //console.log('Channel not found or Insuffecient Permissions @ Canvas.welcome');
    };

    handleWcMsg(guildMember, channel);
};
