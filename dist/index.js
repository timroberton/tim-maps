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
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const imageData = ctx.createImageData(opts.mapPixelW, opts.mapPixelH);
  const nPixels = data.pixPopUint8.length;
  const nFacilities = (data.facLocations?.length ?? 0) / 2;
  const colorMap = {};
  const resultsObject = structuredClone(
    helpers.results?.startingObject ?? {}
  );
  if (nPixels !== imageData.width * imageData.height) {
    throw new Error("pixPopUint8 not same length as canvas");
  }
  if (data.pixPopFloat32 && data.pixPopFloat32.length !== nPixels) {
    throw new Error("pixPopFloat32 not same length as pixPopUint8");
  }
  if (data.facValues && data.facValues.length !== nFacilities) {
    throw new Error("facLocations not twice the length of facValues");
  }
  if (data.pixNearestFacNumber && data.pixNearestFacNumber.length !== nPixels) {
    throw new Error("pixNearestFacNumber not equal to pixPopUint8");
  }
  if (data.pixNearestFacDistance && data.pixNearestFacDistance.length !== nPixels) {
    throw new Error("pixNearestFacDistance not equal to pixPopUint8");
  }
  if (!helpers.getPixelColor && opts.pixelColor === void 0) {
    throw new Error("At least one pixelColor opt needs to be defined");
  }
  if (!helpers.getPointColor && opts.pointColor === void 0) {
    throw new Error("At least one pointColor opt needs to be defined");
  }
  if (!helpers.getPointStyle && opts.pointStyle === void 0) {
    throw new Error("At least one pointStyle opt needs to be defined");
  }
  if (!helpers.getPointRadius && opts.pointRadius === void 0) {
    throw new Error("At least one pointRadius opt needs to be defined");
  }
  if (!helpers.getPointStrokeWidth && opts.pointStrokeWidth === void 0) {
    throw new Error("At least one pointStrokeWidth opt needs to be defined");
  }
  if (data.pixNearestFacNumber) {
    let minFacIndex = Number.POSITIVE_INFINITY;
    let maxFacIndex = Number.NEGATIVE_INFINITY;
    data.pixNearestFacNumber.forEach((v) => {
      minFacIndex = Math.min(v - 1, minFacIndex);
      maxFacIndex = Math.max(v - 1, maxFacIndex);
    });
    if (minFacIndex < 0 || minFacIndex > nFacilities - 1) {
      throw new Error("Bad nearest fac number");
    }
    if (maxFacIndex < 0 || maxFacIndex > nFacilities - 1) {
      throw new Error("Bad nearest fac number");
    }
  }
  if (data.pixNearestFacNumber) {
    let minFacIndex = Number.POSITIVE_INFINITY;
    let maxFacIndex = Number.NEGATIVE_INFINITY;
    data.pixNearestFacNumber.forEach((v) => {
      minFacIndex = Math.min(v - 1, minFacIndex);
      maxFacIndex = Math.max(v - 1, maxFacIndex);
    });
    if (minFacIndex < 0 || minFacIndex > nFacilities - 1) {
      throw new Error("Bad nearest fac number");
    }
    if (maxFacIndex < 0 || maxFacIndex > nFacilities - 1) {
      throw new Error("Bad nearest fac number");
    }
  }
  for (let iPix = 0; iPix < nPixels; iPix++) {
    if (data.pixPopUint8[iPix] === 255) {
      continue;
    }
    const nearestFacIndex = data.pixNearestFacNumber ? data.pixNearestFacNumber[iPix] - 1 : void 0;
    const adm1Index = data.pixAdm1Index?.[iPix];
    const vals = {
      popFloat32: data.pixPopFloat32?.[iPix],
      // Fac
      nearestFacIndex,
      nearestFacDistance: data.pixNearestFacDistance?.[iPix],
      nearestFacValue: nearestFacIndex !== void 0 ? data.facValues?.[nearestFacIndex] : void 0,
      nearestFacType: nearestFacIndex !== void 0 ? data.facTypes?.[nearestFacIndex] : void 0,
      // Adm 1
      adm1Index: data.pixAdm1Index?.[iPix],
      adm1Value: adm1Index !== void 0 ? data.adm1Values?.[adm1Index] : void 0
    };
    const color = helpers.getPixelColor?.(vals) ?? opts.pixelColor ?? "#000000";
    if (!colorMap[color]) {
      colorMap[color] = chroma(color).rgba();
    }
    const iImgData = iPix * 4;
    imageData.data[iImgData + 0] = colorMap[color][0];
    imageData.data[iImgData + 1] = colorMap[color][1];
    imageData.data[iImgData + 2] = colorMap[color][2];
    imageData.data[iImgData + 3] = data.pixPopUint8[iPix];
    helpers.results?.popAccumulator(resultsObject, vals);
  }
  ctx.putImageData(imageData, opts.mapPixelPad, opts.mapPixelPad);
  if (data.facLocations) {
    for (let iFac = 0; iFac < nFacilities; iFac++) {
      const facX = data.facLocations[iFac * 2];
      const facY = data.facLocations[iFac * 2 + 1];
      const vals = {
        facValue: data.facValues?.[iFac],
        facType: data.facTypes?.[iFac]
      };
      addPoint(
        ctx,
        helpers.getPointStyle?.(vals) ?? opts.pointStyle ?? "circle",
        facX + opts.mapPixelPad,
        facY + opts.mapPixelPad,
        helpers.getPointRadius?.(vals) ?? opts.pointRadius ?? 10,
        helpers.getPointColor?.(vals) ?? opts.pointColor ?? "#000000",
        opts.pointStrokeWidth ?? 3,
        chroma
      );
      helpers.results?.facAccumulator(resultsObject, vals);
    }
  }
  return resultsObject;
}
export {
  renderMap
};
