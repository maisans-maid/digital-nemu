'use strict';

const logger = require('../utility/Logs.message-delete.js');

module.exports = (client, message) => {

    // // Do not read MessageDelete events on this channel
    // if ([
    //     '857925131652956210', // NEMURI's rules & verify channel
    //     '896822322403627071', // My botDEV's general channel
    // ].includes(message.channel.id)){
    //     return;
    // };

    logger(message);

};
