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

// src/get_pixel_vals.ts
function getPixelVals(data, iPixInOriginal) {
  const nearestFacIndex = data.pixNearestFacNumber ? data.pixNearestFacNumber[iPixInOriginal] - 1 : void 0;
  const adm1Index = data.pixAdm1Number ? data.pixAdm1Number[iPixInOriginal] - 1 : void 0;
  return {
    popFloat32: data.pixPopFloat32?.[iPixInOriginal],
    // Fac
    nearestFacIndex,
    nearestFacDistance: data.pixNearestFacDistance?.[iPixInOriginal],
    nearestFacValue: nearestFacIndex !== void 0 ? data.facValues?.[nearestFacIndex] : void 0,
    nearestFacType: nearestFacIndex !== void 0 ? data.facTypes?.[nearestFacIndex] : void 0,
    // Adm 1
    adm1Index,
    adm1Value: adm1Index !== void 0 ? data.adm1Values?.[adm1Index] : void 0
  };
}

// src/render_map.ts
function renderMap(canvas, chroma, data, config) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const nFacilities = (data.facLocations?.length ?? 0) / 2;
  const pixelPad = config.mapPixelPad ?? 0;
  const croppedPixelX = config.crop?.x ?? 0;
  const croppedPixelY = config.crop?.y ?? 0;
  const croppedPixelW = config.crop?.w ?? config.mapPixelW;
  const croppedPixelH = config.crop?.h ?? config.mapPixelH;
  const imageData = ctx.createImageData(croppedPixelW, croppedPixelH);
  const nCroppedPixels = croppedPixelW * croppedPixelH;
  canvas.width = croppedPixelW + 2 * pixelPad;
  canvas.height = croppedPixelH + 2 * pixelPad;
  const colorMap = {};
  const resultsObject = structuredClone(
    config.results?.startingObject ?? {}
  );
  if (config.validate !== false) {
    if (data.pixPopUint8.length < nCroppedPixels) {
      throw new Error("pixPopUint8 is not large enough to cover area");
    }
    if (data.pixPopFloat32 && data.pixPopFloat32.length !== data.pixPopUint8.length) {
      throw new Error("pixPopFloat32 not same length as pixPopUint8");
    }
    if (data.facValues && data.facValues.length !== nFacilities) {
      throw new Error("facLocations not twice the length of facValues");
    }
    if (data.pixNearestFacNumber && data.pixNearestFacNumber.length !== data.pixPopUint8.length) {
      throw new Error("pixNearestFacNumber not equal to pixPopUint8");
    }
    if (data.pixNearestFacDistance && data.pixNearestFacDistance.length !== data.pixPopUint8.length) {
      throw new Error("pixNearestFacDistance not equal to pixPopUint8");
    }
    if (data.pixNearestFacNumber) {
      let minFacIndex = Number.POSITIVE_INFINITY;
      let maxFacIndex = Number.NEGATIVE_INFINITY;
      data.pixNearestFacNumber.forEach((v) => {
        minFacIndex = Math.min(v - 1, minFacIndex);
        maxFacIndex = Math.max(v - 1, maxFacIndex);
      });
      if (minFacIndex < 0 || minFacIndex > nFacilities - 1) {
        throw new Error(`Bad nearest fac number - min is ${minFacIndex}`);
      }
      if (maxFacIndex < 0 || maxFacIndex > nFacilities - 1) {
        throw new Error(`Bad nearest fac number - max is ${maxFacIndex}`);
      }
    }
    if (data.pixAdm1Number && data.adm1Values) {
      const nAdm1s = data.adm1Values.length;
      let minAdm1Index = Number.POSITIVE_INFINITY;
      let maxAdm1Index = Number.NEGATIVE_INFINITY;
      data.pixAdm1Number.forEach((v) => {
        if (v === 255) {
          return;
        }
        minAdm1Index = Math.min(v - 1, minAdm1Index);
        maxAdm1Index = Math.max(v - 1, maxAdm1Index);
      });
      if (minAdm1Index < 0 || minAdm1Index > nAdm1s - 1) {
        throw new Error(`Bad adm1 index - min is ${minAdm1Index}`);
      }
      if (maxAdm1Index < 0 || maxAdm1Index > nAdm1s - 1) {
        throw new Error(`Bad adm1 index - max is ${maxAdm1Index}`);
      }
    }
  }
  let i = -1;
  for (let y = 0; y < croppedPixelH; y++) {
    for (let x = 0; x < croppedPixelW; x++) {
      i += 1;
      const iPixInSmallerCroppedImage = x + y * croppedPixelW;
      if (i !== iPixInSmallerCroppedImage) {
        throw new Error();
      }
      const iPixInOriginal = x + croppedPixelX + (y + croppedPixelY) * config.mapPixelW;
      if (data.pixPopUint8[iPixInOriginal] === 255) {
        continue;
      }
      const vals = getPixelVals(
        data,
        iPixInOriginal
      );
      if (config.filterPixels && !config.filterPixels(vals)) {
        continue;
      }
      const color = config.getPixelColor?.(vals) ?? config.pixelColor ?? "#000000";
      if (!color) {
        throw new Error("What" + JSON.stringify(vals));
      }
      if (!colorMap[color]) {
        colorMap[color] = chroma(color).rgba();
      }
      const iImgData = iPixInSmallerCroppedImage * 4;
      imageData.data[iImgData + 0] = colorMap[color][0];
      imageData.data[iImgData + 1] = colorMap[color][1];
      imageData.data[iImgData + 2] = colorMap[color][2];
      imageData.data[iImgData + 3] = data.pixPopUint8[iPixInOriginal];
      config.results?.popAccumulator?.(resultsObject, vals);
    }
  }
  ctx.putImageData(imageData, pixelPad, pixelPad);
  const scaleFactor = config.crop ? croppedPixelW / config.mapPixelW : 1;
  ctx.scale(scaleFactor, scaleFactor);
  if (data.facLocations) {
    for (let iFac = 0; iFac < nFacilities; iFac++) {
      const facX = data.facLocations[iFac * 2];
      const facY = data.facLocations[iFac * 2 + 1];
      if (facX === -9999 && facY === -9999) {
        continue;
      }
      if (facX < croppedPixelX || facX >= croppedPixelX + croppedPixelW || facY < croppedPixelY || facY >= croppedPixelY + croppedPixelH) {
        continue;
      }
      const iPixInOriginal = facX + facY * config.mapPixelW;
      const pixelVals = getPixelVals(
        data,
        iPixInOriginal
      );
      const facVals = {
        facValue: data.facValues?.[iFac],
        facType: data.facTypes?.[iFac]
      };
      if (config.filterFacs && !config.filterFacs(facVals, pixelVals)) {
        continue;
      }
      addPoint(
        ctx,
        config.getPointStyle?.(facVals, pixelVals) ?? config.pointStyle ?? "circle",
        (facX + pixelPad - croppedPixelX) / scaleFactor,
        (facY + pixelPad - croppedPixelY) / scaleFactor,
        config.getPointRadius?.(facVals, pixelVals) ?? config.pointRadius ?? 10,
        config.getPointColor?.(facVals, pixelVals) ?? config.pointColor ?? "#000000",
        config.pointStrokeWidth ?? 3,
        chroma
      );
      config.results?.facAccumulator?.(resultsObject, facVals, pixelVals);
    }
  }
  return resultsObject;
}
export {
  renderMap
};
