'use strict';

const { createCanvas, loadImage } = require('node-canvas');
const { readdirSync } = require('fs');
const { join } = require('path');
const GIFEncoder = require('gifencoder');

module.exports = async (guildMember, channel) => {

    const canvas = createCanvas(800, 450);
    const ctx = canvas.getContext('2d');
    const name = guildMember.displayName;
    const { width, height } = canvas;

    ctx.font = '25px PressStart2P Regular, "Code2003", "Unifont"'
    ctx.fillStyle = '#000000';
    ctx.fillText(`Welcome to my Cattery,`, 100, 370);
    ctx.fillText(`${name}!`, 100, 410);

    const encoder = new GIFEncoder(width, height);
    const buffers = [];
    const pushBuffers = buffer => buffers.push(buffer);
    const sendContent = () => channel.send({
        content: `Welcome to my Cattery, ${guildMember}`,
        files: [{
            name: 'welcome.gif',
            attachment: Buffer.concat(buffers)
        }]
    });

    encoder.createReadStream()
        .on('data', pushBuffers)
        .on('end', sendContent);

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(65);

    for (const image of readdirSync(join(__dirname, '../assets/images/welcome'))){
        const cvs = createCanvas(width, height);
        const ct  = cvs.getContext('2d');
        const frame = await loadImage(join(__dirname, '../assets/images/welcome', image));

        ct.drawImage(frame, 0, 0);
        ct.drawImage(canvas, 0, 0);

        encoder.addFrame(ct);
    };

    encoder.finish();
};
