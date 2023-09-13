// src/map-renderer/add_points.ts
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

// src/map-renderer/get_pixel_vals.ts
function getPixelVals(data, iPixInOriginal) {
  const hasAdm1Number = data.adm1 && data.adm1.pixAdm1Number[iPixInOriginal] !== 0;
  const adm1Index = hasAdm1Number ? data.adm1.pixAdm1Number[iPixInOriginal] - 1 : void 0;
  if (!data.facs || !data.facs.facLinks) {
    return {
      popFloat32: data.pixPopFloat32?.[iPixInOriginal],
      adm1Index,
      nearestFacs: [],
      adm1Value: adm1Index !== void 0 ? data.adm1?.adm1Values?.[adm1Index] : void 0
    };
  }
  const nearestFacs = [];
  for (let i_f = 0; i_f < data.facs.facLinks.strideNearestFacs; i_f++) {
    const iInNearest = iPixInOriginal * data.facs.facLinks.strideNearestFacs + i_f;
    const hasFacNumber = data.facs.facLinks.pixNearestFacNumber !== void 0 && data.facs.facLinks.pixNearestFacNumber[iInNearest] !== -9999;
    if (!hasFacNumber) {
      nearestFacs.push("nofac");
      continue;
    }
    const facIndex = data.facs.facLinks.pixNearestFacNumber[iInNearest] - 1;
    nearestFacs.push({
      facIndex,
      facDistance: data.facs.facLinks.pixNearestFacDistance[iInNearest],
      facValue: data.facs.facValues?.[facIndex],
      facType: data.facs.facTypes?.[facIndex]
    });
  }
  return {
    popFloat32: data.pixPopFloat32?.[iPixInOriginal],
    // Linked facs
    nearestFacs,
    // Adm 1
    adm1Index,
    adm1Value: adm1Index !== void 0 ? data.adm1?.adm1Values?.[adm1Index] : void 0
  };
}

// src/map-renderer/render_map.ts
function renderMap(canvas, chroma, data, config) {
  const nFacilities = (data.facs?.facLocations.length ?? 0) / 2;
  const pixelPad = config.mapPixelPad ?? 0;
  const croppedPixelX = config.crop?.x ?? 0;
  const croppedPixelY = config.crop?.y ?? 0;
  const croppedPixelW = config.crop?.w ?? data.pixW;
  const croppedPixelH = config.crop?.h ?? data.pixH;
  let ctx;
  let imageData;
  if (canvas) {
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    imageData = ctx.createImageData(croppedPixelW, croppedPixelH);
    canvas.width = Math.round(croppedPixelW + 2 * pixelPad);
    canvas.height = Math.round(croppedPixelH + 2 * pixelPad);
  }
  const nCroppedPixels = croppedPixelW * croppedPixelH;
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
    if (data.facs) {
      if (data.facs.facValues && data.facs.facValues.length !== nFacilities) {
        throw new Error("facLocations not twice the length of facValues");
      }
      if (data.facs.facLinks) {
        if (data.facs.facLinks.pixNearestFacNumber.length !== data.pixPopUint8.length * data.facs.facLinks.strideNearestFacs) {
          throw new Error("pixNearestFacNumber not equal to pixPopUint8");
        }
        if (data.facs.facLinks.pixNearestFacDistance.length !== data.pixPopUint8.length * data.facs.facLinks.strideNearestFacs) {
          throw new Error("pixNearestFacDistance not equal to pixPopUint8");
        }
        let minFacNumber = nFacilities + 1;
        let maxFacNumber = -1;
        data.facs.facLinks.pixNearestFacNumber.forEach((v) => {
          if (v === -9999) {
            return;
          }
          minFacNumber = Math.min(v, minFacNumber);
          maxFacNumber = Math.max(v, maxFacNumber);
        });
        if (minFacNumber < 1 || minFacNumber > nFacilities) {
          throw new Error(
            `Bad nearest fac number - min is ${minFacNumber} but there are ${nFacilities} facilities`
          );
        }
        if (maxFacNumber < 1 || maxFacNumber > nFacilities) {
          throw new Error(
            `Bad nearest fac number - max is ${maxFacNumber} but there are ${nFacilities} facilities`
          );
        }
      }
    }
    if (data.adm1 && data.adm1.adm1Values) {
      const nAdm1s = data.adm1.adm1Values.length;
      let minAdm1Number = nAdm1s + 1;
      let maxAdm1Number = -1;
      data.adm1.pixAdm1Number.forEach((v) => {
        if (v === 0) {
          return;
        }
        minAdm1Number = Math.min(v, minAdm1Number);
        maxAdm1Number = Math.max(v, maxAdm1Number);
      });
      if (minAdm1Number < 1 || minAdm1Number > nAdm1s) {
        throw new Error(
          `Bad adm1 number - min is ${minAdm1Number} but there are ${nAdm1s} adm1s`
        );
      }
      if (maxAdm1Number < 1 || maxAdm1Number > nAdm1s) {
        throw new Error(
          `Bad adm1 number - max is ${maxAdm1Number} but there are ${nAdm1s} adm1s`
        );
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
      const iPixInOriginal = x + croppedPixelX + (y + croppedPixelY) * data.pixW;
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
      config.results?.popAccumulator?.(resultsObject, vals);
      if (imageData) {
        const color = config.getPixelColor?.(vals) ?? config.pixelColor ?? "#000000";
        const transparency = config.getPixelTransparency255?.(vals) ?? config.pixelTransparency255 ?? data.pixPopUint8[iPixInOriginal];
        if (!color || transparency === void 0) {
          throw new Error("What" + JSON.stringify(vals));
        }
        if (!colorMap[color]) {
          colorMap[color] = chroma(color).rgba();
        }
        const iImgData = iPixInSmallerCroppedImage * 4;
        imageData.data[iImgData + 0] = colorMap[color][0];
        imageData.data[iImgData + 1] = colorMap[color][1];
        imageData.data[iImgData + 2] = colorMap[color][2];
        imageData.data[iImgData + 3] = transparency;
      }
    }
  }
  if (imageData && ctx) {
    ctx.putImageData(imageData, pixelPad, pixelPad);
  }
  if (data.facs) {
    for (let iFac = 0; iFac < nFacilities; iFac++) {
      const facX = data.facs.facLocations[iFac * 2];
      const facY = data.facs.facLocations[iFac * 2 + 1];
      if (facX === -9999 && facY === -9999) {
        continue;
      }
      if (facX < croppedPixelX || facX >= croppedPixelX + croppedPixelW || facY < croppedPixelY || facY >= croppedPixelY + croppedPixelH) {
        continue;
      }
      const iPixInOriginal = facX + facY * data.pixW;
      const pixelVals = getPixelVals(
        data,
        iPixInOriginal
      );
      const facVals = {
        facValue: data.facs.facValues?.[iFac],
        facType: data.facs.facTypes?.[iFac]
      };
      if (config.filterFacs && !config.filterFacs(facVals, pixelVals)) {
        continue;
      }
      config.results?.facAccumulator?.(resultsObject, facVals, pixelVals);
      if (ctx) {
        addPoint(
          ctx,
          config.getPointStyle?.(facVals, pixelVals) ?? config.pointStyle ?? "circle",
          facX + pixelPad - croppedPixelX,
          facY + pixelPad - croppedPixelY,
          config.getPointRadius?.(facVals, pixelVals) ?? config.pointRadius ?? 10,
          config.getPointColor?.(facVals, pixelVals) ?? config.pointColor ?? "#000000",
          config.pointStrokeWidth ?? 3,
          chroma
        );
      }
    }
  }
  return resultsObject;
}

// src/map-data-fetcher/deps.ts
 

// src/map-data-fetcher/util_funcs.ts
async function fetchJsonFile(baseUrl, relPath) {
  try {
    const url = `${baseUrl}/${relPath}`;
    return await (await fetch(url)).json().catch(() => {
      return void 0;
    });
  } catch {
    return void 0;
  }
}
async function fetchUint8File(baseUrl, relPath) {
  try {
    const url = `${baseUrl}/${relPath}`;
    return new Uint8Array(await (await fetch(url)).arrayBuffer());
  } catch {
    return void 0;
  }
}
async function fetchInt16File(baseUrl, relPath) {
  try {
    const url = `${baseUrl}/${relPath}`;
    return new Int16Array(await (await fetch(url)).arrayBuffer());
  } catch {
    return void 0;
  }
}
async function fetchInt32File(baseUrl, relPath) {
  try {
    const url = `${baseUrl}/${relPath}`;
    return new Int32Array(await (await fetch(url)).arrayBuffer());
  } catch {
    return void 0;
  }
}
async function fetchFloat32File(baseUrl, relPath) {
  try {
    const url = `${baseUrl}/${relPath}`;
    return new Float32Array(await (await fetch(url)).arrayBuffer());
  } catch {
    return void 0;
  }
}

// src/map-data-fetcher/fetch_map_files.ts
async function fetchMapFiles(url, updateProgress) {
  console.log("Fetching map files from", url);
  updateProgress?.(0.1);
  const dataPackage = await fetchJsonFile(
    url,
    "data_package.json"
  );
  if (!dataPackage || !dataPackage.files) {
    throw new Error(
      "Map file read error: Must have dataPackage with file listing"
    );
  }
  updateProgress?.(0.2);
  const pop_uint8 = dataPackage.files.includes("pop_uint8.bin") ? await fetchUint8File(url, "pop_uint8.bin") : void 0;
  updateProgress?.(0.3);
  const pop_float32 = dataPackage.files.includes("pop_float32.bin") ? await fetchFloat32File(url, "pop_float32.bin") : void 0;
  updateProgress?.(0.4);
  const facilities_int32 = dataPackage.files.includes("facilities_int32.bin") ? await fetchInt32File(url, "facilities_int32.bin") : void 0;
  updateProgress?.(0.5);
  const nearest_int16 = dataPackage.files.includes("nearest_int16.bin") ? await fetchInt16File(url, "nearest_int16.bin") : void 0;
  updateProgress?.(0.6);
  const distance_float32 = dataPackage.files.includes("distance_float32.bin") ? await fetchFloat32File(url, "distance_float32.bin") : void 0;
  updateProgress?.(0.7);
  const adm1_uint8 = dataPackage.files.includes("adm1_uint8.bin") ? await fetchUint8File(url, "adm1_uint8.bin") : void 0;
  updateProgress?.(0.8);
  const adm2_uint8 = dataPackage.files.includes("adm2_uint8.bin") ? await fetchUint8File(url, "adm2_uint8.bin") : void 0;
  updateProgress?.(0.9);
  const facilityInfo = dataPackage.files.includes("facility_info.json") ? await fetchJsonFile(url, "facility_info.json") : void 0;
  updateProgress?.(1);
  if (!pop_uint8) {
    throw new Error("Map file read error: Must have pop_uint8");
  }
  if (nearest_int16 && !facilities_int32) {
    throw new Error(
      "Map file read error: Can't have nearest without facilities"
    );
  }
  if (distance_float32 && !facilities_int32) {
    throw new Error(
      "Map file read error: Can't have distance without facilities"
    );
  }
  if (nearest_int16 && !distance_float32) {
    throw new Error("Map file read error: Can't have nearest without nearest");
  }
  if (distance_float32 && !nearest_int16) {
    throw new Error("Map file read error: Can't have distance without nearest");
  }
  const mapFiles = {
    dataPackage,
    pop_uint8,
    pop_float32,
    facs: facilities_int32 ? {
      facilities_int32,
      facLinks: nearest_int16 && distance_float32 ? {
        nearest_int16,
        distance_float32
      } : void 0,
      facilityInfo
    } : void 0,
    adm1_uint8,
    adm2_uint8
  };
  return mapFiles;
}

// src/map-data-fetcher/get_map_data_from_files.ts
function getMapDataFromFiles(mapFiles, valueFileOverrides) {
  const mapData = {
    pixW: mapFiles.dataPackage.popRasterDimensions.pixelW,
    pixH: mapFiles.dataPackage.popRasterDimensions.pixelH,
    pixPopUint8: mapFiles.pop_uint8,
    pixPopFloat32: mapFiles.pop_float32,
    // Facs
    facs: mapFiles.facs ? {
      facLocations: mapFiles.facs.facilities_int32,
      facValues: valueFileOverrides.facValuesOverride ?? mapFiles.facs.facilityInfo,
      facTypes: valueFileOverrides.facTypesOverride,
      // Linked
      facLinks: mapFiles.facs.facLinks ? {
        pixNearestFacNumber: mapFiles.facs.facLinks.nearest_int16,
        pixNearestFacDistance: mapFiles.facs.facLinks.distance_float32,
        strideNearestFacs: mapFiles.dataPackage.facilitiesInfo.strideNearestFacs
      } : void 0
    } : void 0,
    // Adm1
    adm1: mapFiles.adm1_uint8 ? {
      pixAdm1Number: mapFiles.adm1_uint8,
      adm1Values: valueFileOverrides.adm1ValuesOverride
    } : void 0,
    // Adm2
    adm2: mapFiles.adm2_uint8 ? {
      pixAdm2Number: mapFiles.adm2_uint8,
      adm2Values: valueFileOverrides.adm2ValuesOverride
    } : void 0
  };
  return mapData;
}
export {
  fetchMapFiles,
  getMapDataFromFiles,
  renderMap
};
