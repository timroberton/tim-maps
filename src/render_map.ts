import { PointStyle, addPoint } from "./add_points.ts";
import { Canvas, chroma } from "./deps.ts";

export function renderMap<T extends number | string, U extends number | string>(
  canvas: Canvas,
  chroma: chroma,
  data: {
    pixPopUint8: Uint8Array;
    facLocations: Int32Array;
    pixNearestFacNumber?: Int32Array;
    pixNearestFacDistance?: Float32Array;
    facValues?: T[];
    facTypes?: U[];
  },
  helpers: {
    getPixelColor?: (
      pixNearestFacDistance: number | undefined,
      facValue: T | undefined,
      facType: U | undefined
    ) => string | undefined;
    getPointStyle?: (
      facValue: T | undefined,
      facType: U | undefined
    ) => PointStyle;
    getPointColor?: (facValue: T | undefined, facType: U | undefined) => string;
    getPointRadius?: (
      facValue: T | undefined,
      facType: U | undefined
    ) => number;
  },
  opts: {
    defaultPopColor: string;
    mapPixelW: number;
    mapPixelH: number;
    mapPixelPad: number;
  }
) {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(opts.mapPixelW, opts.mapPixelH);

  const nFacilities = data.facLocations.length / 2;

  if (data.pixPopUint8.length !== imageData.width * imageData.height) {
    throw new Error("pixPopUint8 not same length as canvas");
  }
  if (data.facValues && data.facValues.length !== nFacilities) {
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
    const colorMap: Record<string, [number, number, number]> = {};
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

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

function getFacValueAndType<
  T extends number | string,
  U extends number | string
>(
  data: {
    pixPopUint8: Uint8Array;
    facLocations: Int32Array;
    pixNearestFacNumber?: Int32Array;
    pixNearestFacDistance?: Float32Array;
    facValues?: T[];
    facTypes?: U[];
  },
  nearestFacNumber: number | undefined
): { facValue: T | undefined; facType: U | undefined } {
  if (nearestFacNumber === undefined) {
    return { facValue: undefined, facType: undefined };
  }
  const facValue = data.facValues?.[nearestFacNumber - 1];
  const facType = data.facTypes?.[nearestFacNumber - 1];
  return { facValue, facType };
}
