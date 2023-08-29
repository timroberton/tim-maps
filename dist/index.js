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
  const nFacilities = data.facLocations.length / 2;
  if (data.pixPopUint8.length !== imageData.width * imageData.height) {
    throw new Error("pixPopUint8 not same length as canvas");
  }
  if (
    data.facValues &&
    data.facValues.length * 2 !== data.facLocations.length
  ) {
    throw new Error("facLocations not twice the length of facValues");
  }
  if (
    data.pixNearestFacNumber &&
    data.pixNearestFacNumber.length !== data.pixPopUint8.length
  ) {
    throw new Error("pixNearestFacNumber not equal to pixPopUint8");
  }
  if (
    data.pixNearestFacDistance &&
    data.pixNearestFacDistance.length !== data.pixPopUint8.length
  ) {
    throw new Error("pixNearestFacDistance not equal to pixPopUint8");
  }
  if (helpers.getPixelColor) {
    const colorMap = {};
    for (let iPix = 0; iPix < data.pixPopUint8.length; iPix++) {
      if (data.pixPopUint8[iPix] === 255) {
        continue;
      }
      const nearestFacDistance = data.pixNearestFacDistance?.[iPix];
      const nearestFacNumber = data.pixNearestFacNumber?.[iPix];
      if (
        nearestFacNumber &&
        (nearestFacNumber < 1 || nearestFacNumber > nFacilities)
      ) {
        throw new Error("Bad nearest fac number");
      }
      const { facValue, facType } = getFacValueAndType(data, nearestFacNumber);
      const color =
        helpers.getPixelColor(nearestFacDistance, facValue, facType) ??
        opts.defaultPopColor;
      if (!colorMap[color]) {
        colorMap[color] = chroma(color).rgba();
      }
      const rgb = colorMap[color];
      const iImgData = iPix * 4;
      imageData.data[iImgData + 0] = rgb[0];
      imageData.data[iImgData + 1] = rgb[1];
      imageData.data[iImgData + 2] = rgb[2];
      imageData.data[iImgData + 3] = data.pixPopUint8[iPix];
    }
  } else {
    const defaultPopColorRgb = chroma(opts.defaultPopColor).rgba();
    for (let iPix = 0; iPix < data.pixPopUint8.length; iPix++) {
      if (data.pixPopUint8[iPix] === 255) {
        continue;
      }
      const iImgData = iPix * 4;
      imageData.data[iImgData + 0] = defaultPopColorRgb[0];
      imageData.data[iImgData + 1] = defaultPopColorRgb[1];
      imageData.data[iImgData + 2] = defaultPopColorRgb[2];
      imageData.data[iImgData + 3] = data.pixPopUint8[iPix];
    }
  }
  ctx.putImageData(imageData, opts.mapPixelPad, opts.mapPixelPad);
  const nFacs = data.facLocations.length / 2;
  for (let iFac = 0; iFac < nFacs; iFac++) {
    const facX = data.facLocations[iFac * 2];
    const facY = data.facLocations[iFac * 2 + 1];
    const facValue = data.facValues?.[iFac];
    const facType = data.facTypes?.[iFac];
    addPoint(
      ctx,
      helpers.getPointStyle?.(facValue, facType) ?? "circle",
      facX + opts.mapPixelPad,
      facY + opts.mapPixelPad,
      helpers.getPointRadius?.(facValue, facType) ?? 10,
      helpers.getPointColor?.(facValue, facType) ?? "blue",
      3,
      chroma
    );
  }
}
function getFacValueAndType(data, nearestFacNumber) {
  if (nearestFacNumber === void 0) {
    return { facValue: void 0, facType: void 0 };
  }
  const facValue = data.facValues?.[nearestFacNumber - 1];
  const facType = data.facTypes?.[nearestFacNumber - 1];
  return { facValue, facType };
}
export { renderMap };
