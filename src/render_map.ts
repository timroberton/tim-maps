import { PointStyle, addPoint } from "./add_points.ts";
import { Canvas, chroma } from "./deps.ts";

export type RenderMapData<
  FacValue,
  FacType extends number | string,
  Adm1Value
> = {
  pixPopUint8: Uint8Array;
  pixPopFloat32?: Float32Array;
  // Facs
  facLocations?: Int32Array;
  facValues?: FacValue[];
  facTypes?: FacType[];
  pixNearestFacNumber?: Int32Array;
  pixNearestFacDistance?: Float32Array;
  // Adm1
  pixAdm1Index?: Uint8Array;
  adm1Values?: Adm1Value[];
};

export type PixelVals<FacValue, FacType extends number | string, Adm1Value> = {
  popFloat32?: number;
  // Fac
  nearestFacIndex?: number;
  nearestFacDistance?: number;
  nearestFacValue?: FacValue;
  nearestFacType?: FacType;
  // Adm1
  adm1Index?: number;
  adm1Value?: Adm1Value;
};

export type FacVals<FacValue, FacType extends number | string> = {
  // Fac
  facValue?: FacValue;
  facType?: FacType;
};

export function renderMap<
  FacValue,
  FacType extends number | string,
  Adm1Value,
  ResutsObject
>(
  canvas: Canvas,
  chroma: chroma,
  data: RenderMapData<FacValue, FacType, Adm1Value>,
  helpers: {
    results?: {
      startingObject: ResutsObject;
      popAccumulator?: (
        currentObject: ResutsObject,
        vals: PixelVals<FacValue, FacType, Adm1Value>
      ) => void;
      facAccumulator?: (
        currentObject: ResutsObject,
        vals: FacVals<FacValue, FacType>
      ) => void;
    };
    getPixelColor?: (vals: PixelVals<FacValue, FacType, Adm1Value>) => string;
    getPointColor?: (vals: FacVals<FacValue, FacType>) => string;
    getPointStyle?: (vals: FacVals<FacValue, FacType>) => PointStyle;
    getPointRadius?: (vals: FacVals<FacValue, FacType>) => number;
    getPointStrokeWidth?: (vals: FacVals<FacValue, FacType>) => number;
  },
  opts: {
    pixelColor?: string;
    pointColor?: string;
    pointStyle?: PointStyle;
    pointRadius?: number;
    pointStrokeWidth?: number;
    mapPixelW: number;
    mapPixelH: number;
    mapPixelPad: number;
  }
): ResutsObject | undefined {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const imageData = ctx.createImageData(opts.mapPixelW, opts.mapPixelH);

  const nPixels = data.pixPopUint8.length;
  const nFacilities = (data.facLocations?.length ?? 0) / 2;

  const colorMap: Record<string, [number, number, number]> = {};
  const resultsObject: ResutsObject = structuredClone(
    helpers.results?.startingObject ?? {}
  );

  ////////////////////////////////////
  //////////// Validation ////////////
  ////////////////////////////////////
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
  if (!helpers.getPixelColor && opts.pixelColor === undefined) {
    throw new Error("At least one pixelColor opt needs to be defined");
  }
  if (!helpers.getPointColor && opts.pointColor === undefined) {
    throw new Error("At least one pointColor opt needs to be defined");
  }
  if (!helpers.getPointStyle && opts.pointStyle === undefined) {
    throw new Error("At least one pointStyle opt needs to be defined");
  }
  if (!helpers.getPointRadius && opts.pointRadius === undefined) {
    throw new Error("At least one pointRadius opt needs to be defined");
  }
  if (!helpers.getPointStrokeWidth && opts.pointStrokeWidth === undefined) {
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
  ////////////////////////////////////
  ////////////////////////////////////
  ////////////////////////////////////

  for (let iPix = 0; iPix < nPixels; iPix++) {
    if (data.pixPopUint8[iPix] === 255) {
      continue;
    }
    const nearestFacIndex = data.pixNearestFacNumber
      ? data.pixNearestFacNumber[iPix] - 1
      : undefined;
    const adm1Index = data.pixAdm1Index?.[iPix];
    const vals: PixelVals<FacValue, FacType, Adm1Value> = {
      popFloat32: data.pixPopFloat32?.[iPix],
      // Fac
      nearestFacIndex,
      nearestFacDistance: data.pixNearestFacDistance?.[iPix],
      nearestFacValue:
        nearestFacIndex !== undefined
          ? data.facValues?.[nearestFacIndex]
          : undefined,
      nearestFacType:
        nearestFacIndex !== undefined
          ? data.facTypes?.[nearestFacIndex]
          : undefined,
      // Adm 1
      adm1Index: data.pixAdm1Index?.[iPix],
      adm1Value:
        adm1Index !== undefined ? data.adm1Values?.[adm1Index] : undefined,
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
    helpers.results?.popAccumulator?.(resultsObject, vals);
  }

  ctx.putImageData(imageData, opts.mapPixelPad, opts.mapPixelPad);

  if (data.facLocations) {
    for (let iFac = 0; iFac < nFacilities; iFac++) {
      const facX = data.facLocations[iFac * 2];
      const facY = data.facLocations[iFac * 2 + 1];
      const vals: FacVals<FacValue, FacType> = {
        facValue: data.facValues?.[iFac],
        facType: data.facTypes?.[iFac],
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
      helpers.results?.facAccumulator?.(resultsObject, vals);
    }
  }

  return resultsObject;
}
