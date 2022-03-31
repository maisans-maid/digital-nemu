const { createCanvas, loadImage } = require('node-canvas');
const { createRoundedRect, createGradientStyle } = require('./Canvas.tools.js');
const { join } = require('path');

module.exports = async (guildMember, userProfile) => {

    const canvas = createCanvas(350, 350);
    const ctx = canvas.getContext('2d');
    const imageDir = join(__dirname, '../assets/images/xp');

    const level = userProfile.xp.find(x => x.id === guildMember.guild.id).level;
    const banner = await loadImage(join(imageDir, 'levelup.png'));
    const confetti = await loadImage(join(imageDir, 'confetti.png'));
    const logo = await loadImage(join(imageDir, 'logo_small.png'));
    const avatar = await loadImage(guildMember.user.displayAvatarURL({ size: 512, format: 'png', dynamic: false }));
    const x = canvas.width / 2;
    const y = (canvas.height / 2) - 70;
    const radius = 80;

    ctx.beginPath();
    createRoundedRect(ctx, 0, y - 35, canvas.width, canvas.height - 70, 20);
    ctx.fillStyle = '#87839a';
    ctx.fill();
    ctx.save()


    createRoundedRect(ctx, 5, y - 30, canvas.width - 10, canvas.height - 90, 20); //path only
    ctx.fillStyle = '#f9f9fb';
    ctx.fill();
    ctx.clip();
    ctx.lineWidth = 30;
    let pt = 0;
    ctx.strokeStyle = '#f3f2f8';
    while (pt < canvas.width * 2){
        ctx.beginPath();
        ctx.moveTo(pt, 0);
        ctx.lineTo(pt - canvas.width, canvas.height);
        ctx.stroke();
        pt += 80;
    };
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000';
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(avatar, x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();

    ctx.drawImage(banner, 0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.font = '25px PressStart2P Regular';
    ctx.fillStyle = '#DAA6FF';
    ctx.strokeStyle = '#87839a';
    ctx.lineWidth = 2;
    ctx.fillText(`Level ${level}!`, x, (canvas.height / 2) + 125);
    ctx.strokeText(`Level ${level}!`, x, (canvas.height / 2) + 125);

    ctx.drawImage(confetti, (canvas.width / 2) - (confetti.width / 2), 0);

    const logoWidth = 90, logoHeight = logoWidth / 2
    createRoundedRect(ctx, (canvas.width / 2) - (logoWidth / 2), canvas.height - logoHeight, logoWidth, logoHeight, 10);
    ctx.fillStyle = '#87839a';
    ctx.fill();
    ctx.drawImage(logo, (canvas.width / 2) - (logoWidth / 2), canvas.height - logoHeight, logoWidth, logoHeight);

    return canvas.toBuffer();
};
