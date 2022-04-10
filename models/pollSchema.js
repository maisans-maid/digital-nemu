const { model, Schema } = require('mongoose');

const PollSchema = new Schema({
    _id: String,
    guildId: { type: String, default: null },
    channelId: { type: String, default: null },
    authorId: { type: String, default: null },
    topic: { type: String, default: null },
    choices: { type: Array, default: [] },
    timestamp: { type: Date, default: Date.now() },
}, {
    versionKey: false
});

PollSchema.methods.addChoice = function addChoice(topic){
    this.choices.push({
        id: this.choices.length + 1,
        topic: topic,
        voters: []
    });
    return this;
};

PollSchema.methods.totalVotes = function totalVotes(){
    return this.choices.reduce((acc, cur) => cur.voters.length + acc, 0);
};

PollSchema.methods.addVote = function addVote(options){
    const userId = options.userId;
    const choiceId = options.choiceId;
    const choiceIndex = this.choices.findIndex(x => x.id == choiceId);

    // if (this.choices.some(choice => choice.voters.includes(userId))){
    //     const index1 = this.choices.findIndex(choice => choice.voters.includes(userId));
    //     this.choices[index1].voters.splice(this.choices[index1].voters.findIndex(v => voterID === userId), 1);
    // };

    this.choices[choiceIndex].voters.push(userId);
    return this;
};

module.exports = model('pollDocument', PollSchema);
