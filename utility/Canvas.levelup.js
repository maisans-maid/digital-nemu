const { createCanvas, loadImage } = require('node-canvas');
const { createRoundedRect, createGradientStyle } = require('./Canvas.tools.js');

module.exports = async (guildMember, userProfile, xpCollection) => {

    const canvas = createCanvas(750, 250);
    const ctx = canvas.getContext('2d');
    const wallpaper;

    const avatar = await loadImage(user.displayAvatarURL({ size: 512, format: 'png', dynamic: false }));

    ctx.beginPath();
};
