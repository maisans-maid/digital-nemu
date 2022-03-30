'use strict';

const multiplier = 1;

module.exports = class EXPCalc{
    // MIN and MAX amt of xp to be given
    static MAX = 20;
    static MIN = 10;

    constructor(userProfile, guildProfile, guildMember){
        this.userAsFromDB = userProfile;
        this.guildAsFromDB = guildProfile;
        this.member = guildMember;
        this._index = this.userAsFromDB.xp.findIndex(x => x.id === this.member.guild.id);

        if (this._index < 0){
            this.userAsFromDB.xp.push({
                xp: 0,
                id: this.member.guild.id,
                level: 1
            });
            this.index = this.userAsFromDB.xp.findIndex(x => x.id === this.member.guild.id);
        };

        this.data  = this.userAsFromDB.xp.splice(this._index, 1)[0];
        this.roles = [];
    };

    add(amount){
        this.data.xp += Math.round(amount * multiplier);
        while (this.next(this.data.level, this.data.xp) < 1){
            this._incrementLevel();
        };
        return this;
    };

    cap(level){
        return 50 * Math.pow(level, 2) + 250 * level;
    };

    next(level, xp){
        return this.cap(level) - xp;
    };

    _incrementLevel(){
        this.data.level++;
        const { levelRewards } = this.guildAsFromDB;
        const roles = [...Array(this.data.level + 1).keys()]
            .slice(1)
            .map(level => this.member.guild.roles.cache.get(levelRewards.find(x => x.level === level)?.role)?.id).filter(Boolean);
        this.roles = [...new Set(roles.concat(this.roles))];
        return this;
    };

    async save(){
        let errors = [];
        let success = false;
        if (this.roles.length){
            try {
                await this.member.roles.add(this.roles);
            } catch (e) {
                errors.push(e);
            };
        };
        if (this.userAsFromDB.xp.some(x => x.id === this.data.id)){
           return { success, errors: 'Multiple data found for this guild' };
        };
        this.userAsFromDB.xp.push(this.data);
        try {
            await this.userAsFromDB.save();
            success = true;
        } catch (e) {
            errors.push(e)
        };
        return { success, errors };
    };
};
