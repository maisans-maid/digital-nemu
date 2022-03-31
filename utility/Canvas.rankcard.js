'use strict';

const { createCanvas, loadImage } = require('node-canvas');
const { join } = require('path');

module.exports = async (interaction, profile, rank) => {

    const canvas = createCanvas(800,400);
    const ctx = canvas.getContext('2d');

    const level = profile.xp.find(x => x.id === interaction.guild.id).level;
    const avatar = await loadImage(interaction.user.displayAvatarURL({ size: 512, format: 'png', dynamic: false }));
    const rankcard = await loadImage(join(__dirname, '../assets/images/xp/rank.png'));
    const logo = await loadImage(join(__dirname, '../assets/images/xp/logo_small.png'));

    ctx.drawImage(avatar, 70, 60, 170, 170);

    const subdocument = profile.xp.find(x => x.id === interaction.guildId) || { level: 1, xp: 0 };
    const xpCurrent = subdocument.xp - cap(subdocument.level - 1);
    const xpCurrMax = cap(subdocument.level) - cap(subdocument.level - 1);
    const xpPercent = xpCurrent / xpCurrMax;

    ctx.lineWidth = 40;
    ctx.strokeStyle = '#350e3d';
    ctx.moveTo(340, 220);
    ctx.lineTo(730, 220);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = '#9d9d9d';
    ctx.moveTo(340, 220);
    ctx.lineTo(370 + (390 * xpPercent) ,220);
    ctx.stroke();


    ctx.drawImage(rankcard, 0, 0);

    ctx.font = '30px PressStart2P Regular, "Code2003", "Unifont"';
    ctx.fillText(interaction.member.displayName, 340, 180, canvas.width - 370);

    ctx.font = '25px PressStart2P Regular';
    ctx.textAlign = 'right';
    ctx.fillText(`${xpCurrent}/${xpCurrMax} XP`, canvas.width - 50, 290);

    ctx.textAlign = 'center';
    const nthWidth = ctx.measureText(`Lvl ${subdocument.level}`).width;
    ctx.beginPath();
    ctx.strokeStyle = '#591866';
    ctx.moveTo(155 - nthWidth/2, 287);
    ctx.lineTo(155 + nthWidth/2, 287);
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.fillStyle = '#ffffff'
    ctx.fillText(`Lvl ${subdocument.level}`, 155, 300);

    const nthWidth2 = ctx.measureText(`# ${rank}`).width;
    ctx.beginPath();
    ctx.moveTo(155 - nthWidth2/2, 337);
    ctx.lineTo(155 + nthWidth2/2, 337);
    ctx.stroke();
    ctx.fillText(`# ${rank}`, 155, 350);

    const logoWidth = 200, logoHeight = logoWidth / 2;
    ctx.drawImage(logo, canvas.width - logoWidth, canvas.height - logoHeight, logoWidth, logoHeight);


    return canvas.toBuffer();
};

function cap(level){
  return 50 * Math.pow(level, 2) + 250 * level;
};
