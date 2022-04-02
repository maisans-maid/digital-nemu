const { model, Schema } = require('mongoose');

const GuildSchema = new Schema({
    _id: String,
    channels: {
        clearMessages: {
            type: String,
            default: null
        },
        levelUp: {
            type: String,
            default: null
        },
        supportCategoryId: {
            type: String,
            default: null
        },
        supportTextId: {
            type: String,
            default: null
        },
        supportTranscriptId: {
            type: String,
            default: null
        },
        supportCategoryChildren: {
            type: Array,
            default: []
        },
        logger: {
            type: String,
            default: null
        },
        verification: {
            type: String,
            default: null
        },
        welcome: {
            type: String,
            default: null
        }
    },
    roles: {
        verification: {
            type: String,
            default: null
        }
    },
    text: {
        welcome: {
            type: String,
            default: null
        }
    },
    levelRewards: {
        type: Array,
        default: []
    },
    supportReasons: {
        type: Array,
        default: [
            'Filing any complaints',
            'Punishment/penalty appeals'
        ],
        validate: {
            // make sure the reasons does fall under the 1000 embed value char limit
            validator: array => array.reduce((acc, cur) => acc + 4 + cur.length, 0) < 1000,
            message: () => `Max character (1000) exceeded for the reasons. Please remove other reason or make sure that all the reasons is within the 1000 character limit.`
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
