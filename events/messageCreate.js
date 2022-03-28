const deploy = require('../utility/Commands.deploy.js');

module.exports = async (client, message) => {
    if (message.content === 'deploycommands'){
        if (message.member.permissions.has('MANAGE_GUILD')){
            deploy(client, message.guild)
        }
    }
};
