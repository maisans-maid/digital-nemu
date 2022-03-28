const { model, Schema } = require('mongoose');

const GuildSchema = new Schema({
    _id: String,
    channels: {
        clearMessages: {
            type: String,
            default: null
        }
    }
}, {
    versionKey: false
});

GuildSchema.statics.findByIdOrCreate = async function findByIdOrCreate(id) {
    let document = await this.findById(id);
    if (document == null || !document){
        document = new this({ _id: id });
    };
    return document;
};

module.exports = model('guildProfile', GuildSchema);
