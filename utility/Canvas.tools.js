'use strict';

exports.createRoundedRect = function (ctx, x1, y1, x2, y2, radius) {
    ctx.beginPath();
    ctx.moveTo(x1, radius);
    ctx.arcTo(x1, y1, x1 + radius, y1, radius);
    ctx.lineTo(x2 - radius, y1);
    ctx.arcTo(x2, y1, x2, radius, radius);
    ctx.lineTo(x2, y2 - radius);
    ctx.arcTo(x2, y2, x2-radius ,y2 ,radius);
    ctx.lineTo(radius, y2);
    ctx.arcTo(x1, y2, x1, y2 - radius, radius);
    ctx.closePath();
};


exports.createGradientStyle = function (ctx, x1, y1, x2, y2, c1='rgb(126,99,214)',c2='rgb(206,74,162)'){
    ctx.beginPath();

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, c1);
        gradient.addColorStop(1, c2);
    return gradient;
};
