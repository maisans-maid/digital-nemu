const { model, Schema } = require('mongoose');

const PollSchema = new Schema({
    _id: String,
    guildId: { type: String, default: null },
    channelId: { type: String, default: null },
    authorId: { type: String, default: null },
    topic: { type: String, default: null },
    choices: { type: Map, default: new Map() },
    timestamp: { type: Date, default: Date.now() },
}, {
    versionKey: false
});

PollSchema.methods.addChoice = function addChoice(topic){
    this.choices.set((this.choices.size + 1).toString(), {
        id: this.choices.size + 1,
        topic: topic,
        voters: []
    });
    return this;
};

PollSchema.methods.totalVotes = function totalVotes(){
    return Array.from(this.choices).map(x => x[1]).reduce((acc, cur) => cur.voters.length + acc, 0);
};

PollSchema.methods.addVote = function addVote(options){
    const userId = options.userId;
    const choiceId = options.choiceId;
    const choiceArray = [...this.choices.values()];

    if (choiceArray.some(x => x.voters.includes(userId))){
        const key = [...this.choices.entries()]
            .filter(([k, v]) => v.voters.includes(userId))
            .map(([k, v]) => k)[0];

        if (choiceId === key){
            return this;
        };

        const choice = this.choices.get(key);
        choice.voters.splice(choice.voters.indexOf(userId), 1);
        this.choices.set(key, choice);
    };

    const selection = this.choices.get(choiceId);
    selection.voters.push(userId)
    this.choices.set(choiceId, selection);

    return this;
};

PollSchema.methods.processVotes = function processVotes(){
    this.choices = Object.fromEntries(this.choices);
    return this;
};

module.exports = model('pollDocument', PollSchema);
