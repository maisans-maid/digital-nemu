'use strict';

const model = require('../../models/guildSchema');
const { MessageEmbed } = require('discord.js');

module.exports = async message => {

    if (message.bot){
        return;
    };

    if (!message.guild){
        return;
    };

    const guildSchemaPartial = message.client.custom.cache.guildSchemaPartials.get(message.guild.id) || {};

    if (guildSchemaPartial.verificationChannelId === undefined || guildSchemaPartial.verificationRoleId === undefined || guildSchemaPartial.loggerChannelId === undefined){
        const profile = await model.findByIdOrCreate(message.guild.id).catch(e => e);
        if (profile instanceof Error){
            return console.log(profile.message);
        };
        guildSchemaPartial.verificationChannelId = profile.channels.verification;
        guildSchemaPartial.verificationRoleId = profile.roles.verification;
        guildSchemaPartial.loggerChannelId = profile.channels.logger;
        message.client.custom.cache.guildSchemaPartials.set(message.guild.id, guildSchemaPartial);
    };

    if (guildSchemaPartial.verificationChannelId === null){
        return; // No verification channel found
    };

    if (guildSchemaPartial.verificationRoleId === null){
        return; // No verification role found
    };

    const V_CHANNEL = message.guild.channels.cache.get(guildSchemaPartial.verificationChannelId);
    const L_CHANNEL = message.guild.channels.cache.get(guildSchemaPartial.loggerChannelId);
    const V_ROLE = message.guild.roles.cache.get(guildSchemaPartial.verificationRoleId);
    const embed = new MessageEmbed().setAuthor({ name: `❌ IMPORTANT: Member verification failed for ${message.member.displayName}` }).setColor('ORANGE')

    if (!message.guild.me.roles.cache.has('MANAGE_ROLES')){
        await message.delete().catch(() => {});
        embed.addFields([{
            name: 'Reason',
            value: 'I have no permission to add roles.'
        },{
            name: 'Suggested Fix',
            value: 'Grant me the `Manage Roles` permission.'
        }]);
        if (!L_CHANNEL || !L_CHANNEL.permissionsFor(message.client.user).has('SEND_MESSAGES', 'EMBED_LINKS')){
            return console.log(`❌ IMPORTANT: Member verification failed for ${message.member.displayName}. Reason: I have no permission to add roles. Suggested Fix: Grant me the \`Manage Roles\` permission.`);
        };
        return L_CHANNEL.send({ embeds: [embed] });
    };

    if (!V_CHANNEL){
        await message.delete().catch(() => {});
        // Verification is set but the id is now invalid
        embed.addFields([{
            name: 'Reason',
            value: 'Invalid verification channelId'
        },{
            name: 'Suggested Fix',
            value: 'Reset the verification channel via the \`\setchannel\` command.'
        }]);
        if (!L_CHANNEL || !L_CHANNEL.permissionsFor(message.client.user).has('SEND_MESSAGES', 'EMBED_LINKS')){
            return console.log(`❌ IMPORTANT: Member verification failed for ${message.member.displayName}. Reason: Invalid verification channelId. Suggested Fix: Reset the verification channel via the \`\setchannel\` command.`);
        };
        return L_CHANNEL.send({ embeds: [embed] });
    };

    if (!V_ROLE){
        await message.delete().catch(() => {});
        embed.addFields([{
            name: 'Reason',
            value: 'Invalid verification roleId'
        },{
            name: 'Suggested Fix',
            value: 'Reset the verification role via the \`\setrole\` command.'
        }]);
        if (!L_CHANNEL || !L_CHANNEL.permissionsFor(message.client.user).has('SEND_MESSAGES', 'EMBED_LINKS')){
            return console.log(`❌ IMPORTANT: Member verification failed for ${message.member}.\nReason: Invalid verification roleId\nSuggested fix: Reset the verification role via the \`\setrole\` command.`);
        };
        return L_CHANNEL.send({ embeds: [embed] });
    };

    if (message.channel.id === V_CHANNEL.id){
        await message.delete().catch(() => {});
    };

    if (message.content !== 'sleepy head'){
        return;
    };

    if (message.member.roles.cache.has(V_ROLE.id)){
        return; // Member already has the verified role
    };

    await message.member.roles.add(V_ROLE.id)
        .then(() => {/*Insert code here what to do if a member is verified*/})
        .catch(() => {});

};
