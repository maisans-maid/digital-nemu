require('dotenv').config();
require('./fonts');
require('moment-duration-format');

// Heroku for backup accounts, if the date is 1-25, turn off this instance.
if ('BACKUPMODE' in process.env && new Date().getDate() < 24){
    process.exit(1);
};

const { Intents, Client, Collection, Options } = require('discord.js');
const { join } = require('path');
const { readdirSync } = require('fs');

const client = new Client({
    intents: [ ...Object.keys(Intents.FLAGS) ],
    partials: [ 'MESSAGE' ],
    presence: { status: 'dnd', activities: [{
        name: 'Pusanggala v0.1.0',
        type: 'PLAYING',
    }]}
});

client.custom = {
    cache: {
        guildSchema: new Collection(),
        talkingUsers: new Collection(),
        usersOnVC: new Collection(),
        games: new Collection()
    },
    commands: new Collection(),
    database: require('mongoose')
};

client.custom.database.connect(process.env.MONGO_CONNECTION_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    autoIndex: false,
    connectTimeoutMS: 10000,
    family: 4
});

client.custom.database.Promise = global.Promise;

client.once('ready', () => console.log(`${client.user.tag} is ready!`));
client.custom.database.connection.once('connected', () => console.log('Connected to database!'));

const filter = (f) => f.split('.').pop() === 'js';

for (const command of readdirSync(join(__dirname, 'commands')).filter(f => filter(f))){
    const cmd = require(join(__dirname, 'commands', command));
    client.custom.commands.set(cmd.builder.name, cmd.execute);
};

for (const event of readdirSync(join(__dirname, 'events')).filter(f => filter(f))){
    const evt = require(join(__dirname, 'events', event));
    client.on(event.split('.')[0], evt.bind(null, client));
};

client.login(process.env.TOKEN);

for (const event of [
    'uncaughtException',
    'unhandledRejection',
    'rejectionHandled'
]){
    process.on(event, (err) => console.log(err));
};
