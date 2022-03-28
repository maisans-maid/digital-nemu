const { model, Schema } = require('mongoose');

const UserSchema = new Schema({
    _id: String,
    gameStats: {
        minesweeper: {
            gamesPlayed:  { type: Number, default: 0 },
            highestScore: { type: Number, default: 0 }
        },
        tictactoe: {
            won: { type: Number, default: 0 },
            lost: { type: Number, default: 0}
        },
        hangman: {
            won: { type: Number, default: 0 },
            lost: {type: Number, default: 0 }
        }
    }
}, {
    versionKey: false
});

UserSchema.statics.findByIdOrCreate = async function findByIdOrCreate(id) {
    let document = await this.findById(id);
    if (document == null || !document){
        document = new this({ _id: id });
    };
    return document;
};

module.exports = model('userProfile', UserSchema);
