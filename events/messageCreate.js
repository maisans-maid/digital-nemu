'use strict';

const deploy = require('../utility/Commands.deploy.js');
const calculateXP = require('../processes/exp-system/calculate.message.js');

module.exports = async (client, message) => {
    if (message.content === 'deploycommands::21124'){
        if (message.member.permissions.has('MANAGE_GUILD')){
            deploy(client, message.guild)
        }
    }

    if (message.author.bot) return;

    const { status, errors } = await calculateXP(client, message);

    // console.log(status) // Displays debug stats

    if (errors.length){
        console.log(errors);
    };
};
