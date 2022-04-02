'use strict';

const deploy = require('../utility/Commands.deploy.js');
const calculateXP = require('../processes/exp-system/calculate.message.js');
const verify = require('../processes/verify/verify.text.js');

module.exports = async (client, message) => {

    if (message.author.bot) return;

    const { status, errors } = await calculateXP(client, message);

    // console.log(status) // Displays debug stats

    if (errors.length){
        console.log(errors);
    };

    /**
     * Verification System for Digital Nemu
     */
    verify(message);
};
