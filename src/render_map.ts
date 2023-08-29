import { PointStyle, addPoint } from "./add_points.ts";
import { Canvas, chroma } from "./deps.ts";

export function renderMap<
  T extends number | string,
  U extends number | string,
  R
>(
  canvas: Canvas,
  chroma: chroma,
  data: {
    pixPopUint8: Uint8Array;
    pixPopFloat32?: Float32Array;
    facLocations: Int32Array;
    pixNearestFacNumber?: Int32Array;
    pixNearestFacDistance?: Float32Array;
    facValues?: T[];
    facTypes?: U[];
  },
  helpers: {
    results?: {
      startingObject: R;
      popAccumulator: (
        currentObject: R,
        pop: number,
        nearestFacDistance: number | undefined,
        nearestFacValue: T | undefined,
        nearestFacType: U | undefined
      ) => void;
      facAccumulator: (
        currentObject: R,
        facValue: T | undefined,
        facType: U | undefined
      ) => void;
    };
    getPixelColor?: (
      nearestFacDistance: number | undefined,
      nearestFacValue: T | undefined,
      nearestFacType: U | undefined
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
    defaultFacPointColor: string;
    defaultFacPointStyle: PointStyle;
    defaultFacPointRadius: number;
    defaultFacPointStrokeWidth: number;
    mapPixelW: number;
    mapPixelH: number;
    mapPixelPad: number;
  }
): R | undefined {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(opts.mapPixelW, opts.mapPixelH);

  const nPixels = data.pixPopUint8.length;
  const nFacilities = data.facLocations.length / 2;

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
  if (
    data.pixNearestFacDistance &&
    data.pixNearestFacDistance.length !== nPixels
  ) {
    throw new Error("pixNearestFacDistance not equal to pixPopUint8");
  }

  const colorMap: Record<string, [number, number, number]> = {};
  const resultsObject: R = structuredClone(
    helpers.results?.startingObject ?? {}
  );

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
      helpers.getPixelColor?.(nearestFacDistance, facValue, facType) ??
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
    helpers.results?.popAccumulator(
      resultsObject,
      data.pixPopFloat32?.[iPix] ?? 0,
      nearestFacDistance,
      facValue,
      facType
    );
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
      helpers.getPointStyle?.(facValue, facType) ?? opts.defaultFacPointStyle,
      facX + opts.mapPixelPad,
      facY + opts.mapPixelPad,
      helpers.getPointRadius?.(facValue, facType) ?? opts.defaultFacPointRadius,
      helpers.getPointColor?.(facValue, facType) ?? opts.defaultFacPointColor,
      opts.defaultFacPointStrokeWidth,
      chroma
    );
    helpers.results?.facAccumulator(resultsObject, facValue, facType);
  }

  return resultsObject;
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
