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
function renderMap(canvas, chroma, data, config) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const imageData = ctx.createImageData(config.mapPixelW, config.mapPixelH);
  const nPixels = data.pixPopUint8.length;
  const nFacilities = (data.facLocations?.length ?? 0) / 2;
  const pixelPad = config.mapPixelPad ?? 0;
  const colorMap = {};
  const resultsObject = structuredClone(
    config.results?.startingObject ?? {}
  );
  if (config.validate !== false) {
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
    if (data.pixNearestFacNumber) {
      let minFacIndex = Number.POSITIVE_INFINITY;
      let maxFacIndex = Number.NEGATIVE_INFINITY;
      data.pixNearestFacNumber.forEach((v) => {
        minFacIndex = Math.min(v - 1, minFacIndex);
        maxFacIndex = Math.max(v - 1, maxFacIndex);
      });
      if (minFacIndex < 0 || minFacIndex > nFacilities - 1) {
        throw new Error(`Bad  nearest fac number - min is ${minFacIndex}`);
      }
      if (maxFacIndex < 0 || maxFacIndex > nFacilities - 1) {
        throw new Error(`Bad  nearest fac number - max is ${maxFacIndex}`);
      }
      if (minFacIndex !== 0) {
        throw new Error(`Bad  nearest fac number - min is not 0`);
      }
      if (maxFacIndex !== nFacilities - 1) {
        throw new Error(
          `Bad  nearest fac number - max does not match length of pixNearestFacNumber`
        );
      }
    }
    if (data.pixAdm1Number && data.adm1Values) {
      const nAdm1s = data.adm1Values.length;
      let minAdm1Index = Number.POSITIVE_INFINITY;
      let maxAdm1Index = Number.NEGATIVE_INFINITY;
      data.pixAdm1Number.forEach((v) => {
        minAdm1Index = Math.min(v - 1, minAdm1Index);
        maxAdm1Index = Math.max(v - 1, maxAdm1Index);
      });
      if (minAdm1Index < 0 || minAdm1Index > nAdm1s - 1) {
        throw new Error(`Bad adm1 index - min is ${minAdm1Index}`);
      }
      if (maxAdm1Index < 0 || maxAdm1Index > nAdm1s - 1) {
        throw new Error(`Bad adm1 index - max is ${maxAdm1Index}`);
      }
      if (minAdm1Index !== 0) {
        throw new Error(`Bad  adm1 index - min is not 0`);
      }
      if (maxAdm1Index !== nAdm1s - 1) {
        throw new Error(
          `Bad  adm1 index - max does not match length of adm1Values`
        );
      }
    }
  }
  for (let iPix = 0; iPix < nPixels; iPix++) {
    if (data.pixPopUint8[iPix] === 255) {
      continue;
    }
    const nearestFacIndex = data.pixNearestFacNumber ? data.pixNearestFacNumber[iPix] - 1 : void 0;
    const adm1Index = data.pixAdm1Number ? data.pixAdm1Number[iPix] - 1 : void 0;
    const vals = {
      popFloat32: data.pixPopFloat32?.[iPix],
      // Fac
      nearestFacIndex,
      nearestFacDistance: data.pixNearestFacDistance?.[iPix],
      nearestFacValue: nearestFacIndex !== void 0 ? data.facValues?.[nearestFacIndex] : void 0,
      nearestFacType: nearestFacIndex !== void 0 ? data.facTypes?.[nearestFacIndex] : void 0,
      // Adm 1
      adm1Index,
      adm1Value: adm1Index !== void 0 ? data.adm1Values?.[adm1Index] : void 0
    };
    const color = config.getPixelColor?.(vals);
    if (!color) {
      throw new Error("What" + JSON.stringify(vals));
    }
    if (!colorMap[color]) {
      colorMap[color] = chroma(color).rgba();
    }
    const iImgData = iPix * 4;
    imageData.data[iImgData + 0] = colorMap[color][0];
    imageData.data[iImgData + 1] = colorMap[color][1];
    imageData.data[iImgData + 2] = colorMap[color][2];
    imageData.data[iImgData + 3] = data.pixPopUint8[iPix];
    config.results?.popAccumulator?.(resultsObject, vals);
  }
  ctx.putImageData(imageData, pixelPad, pixelPad);
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
        config.getPointStyle?.(vals) ?? config.pointStyle ?? "circle",
        facX + pixelPad,
        facY + pixelPad,
        config.getPointRadius?.(vals) ?? config.pointRadius ?? 10,
        config.getPointColor?.(vals) ?? config.pointColor ?? "#000000",
        config.pointStrokeWidth ?? 3,
        chroma
      );
      config.results?.facAccumulator?.(resultsObject, vals);
    }
  }
  return resultsObject;
}

// src/get_results.ts
function getResults(data, results, config) {
  const nPixels = data.pixPopUint8.length;
  const resultsObject = structuredClone(
    results.startingObject ?? {}
  );
  if (config?.validate !== false) {
    if (data.pixPopFloat32 && data.pixPopFloat32.length !== nPixels) {
      throw new Error("pixPopFloat32 not same length as pixPopUint8");
    }
    if (data.facValues && data.facTypes && data.facValues.length !== data.facTypes.length) {
      throw new Error("facValues not equal to facTypes");
    }
    if (data.pixNearestFacNumber && data.pixNearestFacNumber.length !== nPixels) {
      throw new Error("pixNearestFacNumber not equal to pixPopUint8");
    }
    if (data.pixNearestFacDistance && data.pixNearestFacDistance.length !== nPixels) {
      throw new Error("pixNearestFacDistance not equal to pixPopUint8");
    }
    if (data.pixNearestFacNumber && (data.facValues || data.facTypes)) {
      const nFacilities = data.facValues?.length ?? data.facTypes?.length ?? 0;
      let minFacIndex = Number.POSITIVE_INFINITY;
      let maxFacIndex = Number.NEGATIVE_INFINITY;
      data.pixNearestFacNumber.forEach((v) => {
        minFacIndex = Math.min(v - 1, minFacIndex);
        maxFacIndex = Math.max(v - 1, maxFacIndex);
      });
      if (minFacIndex < 0 || minFacIndex > nFacilities - 1) {
        throw new Error(`Bad  nearest fac number - min is ${minFacIndex}`);
      }
      if (maxFacIndex < 0 || maxFacIndex > nFacilities - 1) {
        throw new Error(`Bad  nearest fac number - max is ${maxFacIndex}`);
      }
      if (minFacIndex !== 0) {
        throw new Error(`Bad  nearest fac number - min is not 0`);
      }
      if (maxFacIndex !== nFacilities - 1) {
        throw new Error(
          `Bad  nearest fac number - max does not match length of pixNearestFacNumber`
        );
      }
    }
    if (data.pixAdm1Number && data.adm1Values) {
      const nAdm1s = data.adm1Values.length;
      let minAdm1Index = Number.POSITIVE_INFINITY;
      let maxAdm1Index = Number.NEGATIVE_INFINITY;
      data.pixAdm1Number.forEach((v) => {
        minAdm1Index = Math.min(v - 1, minAdm1Index);
        maxAdm1Index = Math.max(v - 1, maxAdm1Index);
      });
      if (minAdm1Index < 0 || minAdm1Index > nAdm1s - 1) {
        throw new Error(`Bad adm1 index - min is ${minAdm1Index}`);
      }
      if (maxAdm1Index < 0 || maxAdm1Index > nAdm1s - 1) {
        throw new Error(`Bad adm1 index - max is ${maxAdm1Index}`);
      }
      if (minAdm1Index !== 0) {
        throw new Error(`Bad  adm1 index - min is not 0`);
      }
      if (maxAdm1Index !== nAdm1s - 1) {
        throw new Error(
          `Bad  adm1 index - max does not match length of adm1Values`
        );
      }
    }
  }
  for (let iPix = 0; iPix < nPixels; iPix++) {
    if (data.pixPopUint8[iPix] === 255) {
      continue;
    }
    const nearestFacIndex = data.pixNearestFacNumber ? data.pixNearestFacNumber[iPix] - 1 : void 0;
    const adm1Index = data.pixAdm1Number ? data.pixAdm1Number[iPix] - 1 : void 0;
    const vals = {
      popFloat32: data.pixPopFloat32?.[iPix],
      // Fac
      nearestFacIndex,
      nearestFacDistance: data.pixNearestFacDistance?.[iPix],
      nearestFacValue: nearestFacIndex !== void 0 ? data.facValues?.[nearestFacIndex] : void 0,
      nearestFacType: nearestFacIndex !== void 0 ? data.facTypes?.[nearestFacIndex] : void 0,
      // Adm 1
      adm1Index,
      adm1Value: adm1Index !== void 0 ? data.adm1Values?.[adm1Index] : void 0
    };
    results.popAccumulator?.(resultsObject, vals);
  }
  if (data.facValues || data.facTypes) {
    const nFacilities = data.facValues?.length ?? data.facTypes?.length ?? 0;
    for (let iFac = 0; iFac < nFacilities; iFac++) {
      const vals = {
        facValue: data.facValues?.[iFac],
        facType: data.facTypes?.[iFac]
      };
      results.facAccumulator?.(resultsObject, vals);
    }
  }
  return resultsObject;
}
export {
  getResults,
  renderMap
};
