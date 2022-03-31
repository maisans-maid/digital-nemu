'use strict';

const { Collection } = require('discord.js');
const _ = require('lodash');
const { join } = require('path');

const Calculate = require('./calculate.main.js');
const guildModel = require('../../models/guildSchema.js');
const userModel = require('../../models/userSchema.js');
const getLevelUpImg = require(join(__dirname, '../../utility/Canvas.levelup.js'));

module.exports = async (client, message) => {
    let status = 'fail';

    if (client.custom.cache.usersOnVC.has(message.author.id)){
        return {
            status: `${message.author.id} is on a Voice Channel`,
            errors: []
        };
    };

    let talkingUsers = client.custom.cache.talkingUsers
        .get(message.guild.id);

    if (!talkingUsers){
        talkingUsers = client.custom.cache.talkingUsers
        .set(message.guild.id, new Collection())
        .get(message.guild.id);
    };

    const timestamp = talkingUsers.get(message.author.id) || 0;

    if (timestamp + 6e4 < Date.now()){
        let guildProfile = await guildModel.findByIdOrCreate(message.guild.id).catch(e => e);

        if (guildProfile instanceof Error){
            return {
                status,
                errors: [ guildProfile ]
            };
        };

        let userProfile = await userModel.findByIdOrCreate(message.author.id).catch(e => e);

        if (userProfile instanceof Error){
            return {
                status,
                errors: [ userProfile ]
            };
        };

        const previousLevel = userProfile.xp.find(x => x.id === message.guild.id)?.level || 0;

        const calculation = new Calculate(userProfile, guildProfile, message.member);
        const { success, errors } = await calculation.add(Math.round(_.random(Calculate.MIN, Calculate.MAX))).save();

        if (success){
            client.custom.cache.talkingUsers.get(message.guild.id).set(message.author.id, Date.now());
        };

        if (previousLevel < userProfile.xp.find(x => x.id === message.guild.id).level){
            if (guildProfile.channels.levelUp){
                const channel = message.guild.channels.cache.get(guildProfile.channels.levelUp);
                if (channel && channel.permissionsFor(client.user).has(['VIEW_CHANNEL','SEND_MESSAGES','ATTACH_FILES'])){
                    channel.send({
                        content: `${message.member}, you leveled up!`,
                        files: [{
                            name: 'levelUp.png',
                            attachment: await getLevelUpImg(message.member, userProfile)
                        }]
                    });
                };
            };
        };

        return { status: success , errors };
    };

    return { status: message.author.id + ' is on cooldown', errors: [] };
};
