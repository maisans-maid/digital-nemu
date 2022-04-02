const { SlashCommandBuilder } = require('@discordjs/builders');
const { CLIENTID, GUILDID } = process.env;

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { readdirSync } = require('fs');
const { join } = require('path');

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

module.exports = async (Client, Guild) => {

    const commands = [];
    const Permissions = [];
    const filter = (f) => f.split('.').pop() === 'js';

    // Get commands to register
    for (const commandFile of readdirSync(join(__dirname, '../commands')).filter(f => filter(f))){
      const { builder, permissions } = require(join(__dirname, '../commands', commandFile));
      if (builder instanceof SlashCommandBuilder){
        Permissions.push({ name: builder.name, permissions});
        commands.push(builder.setDefaultPermission(false).toJSON());
      };
    };

    await rest.put(Routes.applicationGuildCommands(Client.user.id, Guild.id),{ body: commands })
    .then(() => console.log('Successfully registered application (/) commands.'))
    //.catch(e => console.log(e.rawError.errors.options['1']));


    const Commands = Guild.commands.fetch();
    let fullPermissions = commands.filter(command => Permissions.some(x => x.name === command.name))
        .map(command => {
            return {
                id: command.id,
                permissions: Permissions.find(p => p.name === command.name).permissions(Guild)//.splice(0,10)
            };
        });

    return Guild.commands.permissions.set({ fullPermissions });
};
