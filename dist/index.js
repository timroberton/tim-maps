// src/add_points.ts
var _COSINE_45 = 0.7071067811865476;
var _SINE_60 = 0.8660254037844386;
var _COSINE_60 = 0.5;
function addPoint(ctx, pointStyle, x, y, radius, color, strokeWidth, chroma) {
  switch (pointStyle) {
    case "circle":
      drawCircle(
        ctx,
        x,
        y,
        radius,
        chroma(color).alpha(0.3).css(),
        color,
        strokeWidth
      );
      return;
    case "cross":
      drawCross(ctx, x, y, radius, color, strokeWidth);
      return;
    case "rect":
      drawRect(
        ctx,
        x,
        y,
        radius,
        chroma(color).alpha(0.3).css(),
        color,
        strokeWidth
      );
      return;
    case "crossRot":
      drawCrossRot(ctx, x, y, radius, color, strokeWidth);
      return;
    case "rectRot":
      drawRectRot(
        ctx,
        x,
        y,
        radius,
        chroma(color).alpha(0.3).css(),
        color,
        strokeWidth
      );
      return;
    case "triangle":
      drawTriangle(
        ctx,
        x,
        y,
        radius,
        chroma(color).alpha(0.3).css(),
        color,
        strokeWidth
      );
      return;
  }
}
function drawCircle(ctx, x, y, radius, fill, stroke, strokeWidth) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}
function drawCrossRot(ctx, x, y, radius, stroke, strokeWidth) {
  const sideGivenRadius = radius * _COSINE_45;
  ctx.beginPath();
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = stroke;
  ctx.moveTo(x - sideGivenRadius, y - sideGivenRadius);
  ctx.lineTo(x + sideGivenRadius, y + sideGivenRadius);
  ctx.moveTo(x + sideGivenRadius, y - sideGivenRadius);
  ctx.lineTo(x - sideGivenRadius, y + sideGivenRadius);
  ctx.stroke();
}
function drawRect(ctx, x, y, radius, fill, stroke, strokeWidth) {
  const sideGivenRadius = radius * _COSINE_45;
  ctx.beginPath();
  ctx.rect(
    x - sideGivenRadius,
    y - sideGivenRadius,
    sideGivenRadius * 2,
    sideGivenRadius * 2
  );
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}
function drawCross(ctx, x, y, radius, stroke, strokeWidth) {
  ctx.beginPath();
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = stroke;
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x, y + radius);
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x - radius, y);
  ctx.stroke();
}
function drawRectRot(ctx, x, y, radius, fill, stroke, strokeWidth) {
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x + radius, y);
  ctx.lineTo(x, y + radius);
  ctx.lineTo(x - radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}
function drawTriangle(ctx, x, y, radius, fill, stroke, strokeWidth) {
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x + radius * _SINE_60, y + radius * _COSINE_60);
  ctx.lineTo(x - radius * _SINE_60, y + radius * _COSINE_60);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

// src/render_map.ts
function renderMap(canvas, chroma, data, helpers, opts) {
  console.log("Rendering map x", canvas.width, canvas.height);
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(opts.mapPixelW, opts.mapPixelH);
  if (data.popUint8.length !== imageData.width * imageData.height) {
    throw new Error("PopUint8 not same length as canvas");
  }
  if (data.facLocations.length !== data.facValues.length * 2) {
    throw new Error("facLocations not twice the length of facValues");
  }
  const popColorRgb = [240, 34, 156, 140];
  for (let iPix = 0; iPix < data.popUint8.length; iPix++) {
    if (data.popUint8[iPix] === 255) {
      continue;
    }
    const iImgData = iPix * 4;
    imageData.data[iImgData + 0] = popColorRgb[0];
    imageData.data[iImgData + 1] = popColorRgb[1];
    imageData.data[iImgData + 2] = popColorRgb[2];
    imageData.data[iImgData + 3] = data.popUint8[iPix];
  }
  ctx.putImageData(imageData, opts.mapPixelPad, opts.mapPixelPad);
  const nFacs = data.facLocations.length / 2;
  for (let iFac = 0; iFac < nFacs; iFac++) {
    const facX = data.facLocations[iFac * 2];
    const facY = data.facLocations[iFac * 2 + 1];
    const facV = data.facValues[iFac];
    addPoint(
      ctx,
      helpers.getPointStyleFromFacValue(facV),
      facX + opts.mapPixelPad,
      facY + opts.mapPixelPad,
      10,
      "blue",
      3,
      chroma
    );
  }
}
export {
  renderMap
};
