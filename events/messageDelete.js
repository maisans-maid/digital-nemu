'use strict';

const logger = require('../utility/Logs.message-delete.js');
const model = require('../models/guildSchema.js');

module.exports = async (client, message) => {

    // // Do not read MessageDelete events on this channel
    // if ([
    //     '857925131652956210', // NEMURI's rules & verify channel
    //     '896822322403627071', // My botDEV's general channel
    // ].includes(message.channel.id)){
    //     return;
    // };

    if (message.author?.bot) return;

    const guildSchemaPartial = message.client.custom.cache.guildSchemaPartials.get(message.guild.id) || {};

    if (guildSchemaPartial.verificationChannelId === undefined){
        const profile = await model.findByIdOrCreate(message.guild.id).catch(e => e);
        if (profile instanceof Error) return console.log('Unable to connect to db');
        guildSchemaPartial.verificationChannelId = profile.channels.verification;
        message.client.custom.cache.guildSchemaPartials.set(message.guild.id, guildSchemaPartial);
    };

    const V_CHANNEL = message.guild.channels.cache.get(guildSchemaPartial.verificationChannelId);

    if (V_CHANNEL && message.channel.id === V_CHANNEL.id){
        return;
    } else {
        logger(message);
    };

};
