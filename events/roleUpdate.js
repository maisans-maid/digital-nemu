'use strict';

const { SlashCommandBuilder } = require('@discordjs/builders')
const { readdirSync } = require('fs');
const { join } = require('path');

module.exports = async (client, oldRole, newRole) => {

    const Permissions = [];
    const filter = (f) => f.split('.').pop() === 'js';

    // Get commands to register
    for (const commandFile of readdirSync(join(__dirname, '../commands')).filter(f => filter(f))){
      const { builder, permissions } = require(join(__dirname, '../commands', commandFile));
      if (builder instanceof SlashCommandBuilder){
          Permissions.push({ name: builder.name, permissions});
      };
    };


    const Commands = await oldRole.guild.commands.fetch();
    let fullPermissions = Commands.filter(command => Permissions.some(x => x.name === command.name))
        .map(command => {
            return {
                id: command.id,
                permissions: Permissions.find(p => p.name === command.name).permissions(oldRole.guild).splice(0,10)
            };
        });

    return oldRole.guild.commands.permissions.set({ fullPermissions });
}
