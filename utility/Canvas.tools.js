'use strict';

exports.createRoundedRect = function (ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y,   x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x,   y+h, r);
    ctx.arcTo(x,   y+h, x,   y,   r);
    ctx.arcTo(x,   y,   x+w, y,   r);
    ctx.closePath();
};


exports.createGradientStyle = function (ctx, x1, y1, x2, y2, c1='rgb(126,99,214)',c2='rgb(206,74,162)'){
    ctx.beginPath();

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, c1);
        gradient.addColorStop(1, c2);
    return gradient;
};
