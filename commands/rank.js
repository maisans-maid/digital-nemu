const { SlashCommandBuilder } = require('@discordjs/builders');
const model = require('../models/userSchema.js');
const getRankImg = require('../utility/Canvas.rankcard.js');

const command = new SlashCommandBuilder()
.setName('rank')
.setDescription('View your xp rank.')

const allowedPermissions = (Guild) => [{
    id: Guild.roles.everyone.id,
    type: 'ROLE',
    permission: true
}];

module.exports = {
    builder: command,
    permissions: allowedPermissions,
    execute: async (client, interaction) => {

        let profile = await model.findByIdOrCreate(interaction.user.id).catch(e => e)

        if (profile instanceof Error){
            return interaction.reply({
                ephemeral: true,
                content: `❌ Error: ${profile.message}`
            });
        };

        const collection = await model.find({ 'xp.id': interaction.guildId },{
            'xp.$': 1,
            '_id' : 1
        }).then(c => c.sort((A,B) => B.xp[0].xp - A.xp[0].xp))
        .catch(e => e);

        const rank = (collection.findIndex(f => f._id === interaction.user.id) + 1) || collection.length + 1;

        await interaction.deferReply();

        const image = await getRankImg(interaction, profile, rank);

        return interaction.editReply({
            files: [{
                name: 'rank.png',
                attachment: image,
            }]
        });
    }
}
