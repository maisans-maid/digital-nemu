'use strict';

const model = require('../../models/guildSchema');
const { MessageEmbed } = require('discord.js');
const { guildSchemaPartial } = require('../../utility/Typedefs.js');
const { errorLog } = require('../../utility/Embed.templates.js');

module.exports = async message => {

    // return;

    if (message.bot){
        return;
    };

    if (!message.guild){
        return;
    };

    let cachedSchema = message.client.custom.cache.guildSchemaPartials.get(message.guild.id);
    if (!cachedSchema){
        const profile = await model.findByIdOrCreate(message.guildId).catch(e => e);
        if (profile instanceof Error){
            return console.log(profile.message);
        };
        cachedSchema = new guildSchemaPartial(message.guild, profile);
        message.client.custom.cache.guildSchemaPartials.set(message.guild.id, cachedSchema);
    };

    const sendError = options => {
        if (cachedSchema.loggerChannel){
            return cachedSchema.loggerChannel.send({
                embeds: [ errorLog({
                    name: options.name,
                    reason: options.reason,
                    fix: options.fix
                }) ]
            })
        } else {
            return console.log(`${options.name}. Reason: ${options.reason || 'N/A'}. Suggested Fix: ${options.fix || 'N/A'}`);
        };
    };

    // Ignore messages that was not sent on the verification channel
    if (message.channel.id !== cachedSchema.verificationChannelId){
        return;
    };

    // Delete messages that are sent in the verification channel
    await message.delete().catch(() => {});

    // A message was sent on a verification channel but there was not verification role
    if (!cachedSchema.verificationRoleId){
        return sendError({
            name: `❌ IMPORTANT: Member verification failed for ${message.member.displayName}`,
            reason: 'Verification Channel was set, but there was no Verification Role',
            fix: 'Set the Verification role via the `\setrole` command.'
        });
    };

    // The message that was sent was not verifiable
    if (message.content !== 'sleepy head'){
        return;
    };

    // The member has the role already
    if (message.member.roles.cache.has(cachedSchema.verificationRoleId)){
        return;
    };

    // The bot (this one) has no permission to add roles to members
    if (!message.guild.me.permissions.has('MANAGE_ROLES')){
        return sendError({
            name: `❌ IMPORTANT: Member verification failed for ${message.member.displayName}`,
            reason: 'I have no permission to assign roles to members!',
            fix: 'Grant me the **Manage Roles** Permission'
        });
    };

    // The configured Role Id does not exist on the guild (anymore)
    if (!cachedSchema.verificationRole){
        return sendError({
            name: `❌ IMPORTANT: Member verification failed for ${message.member.displayName}`,
            reason: 'The configured Verification Role does not exist on this server!',
            fix: 'Reassign a verification role via the `\setrole` command.'
        });
    };

    await message.member.roles.add(cachedSchema.verificationRole)
        .then(() => {/*Insert code here what to do if a member is verified*/})
        .catch(console.error);
};
