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
  // Adm 1
  pixAdm1Index?: Uint8Array;
  adm1Values?: Adm1Value[];
};

export type PixelVals<FacValue, FacType extends number | string, Adm1Value> = {
  popFloat32?: number;
  nearestFacDistance?: number;
  nearestFacValue?: FacValue;
  nearestFacType?: FacType;
  adm1Index?: number;
  adm1Value?: Adm1Value;
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
      popAccumulator: (
        currentObject: ResutsObject,
        vals: PixelVals<FacValue, FacType, Adm1Value>
      ) => void;
      facAccumulator: (
        currentObject: ResutsObject,
        facValue: FacValue | undefined,
        facType: FacType | undefined
      ) => void;
    };
    getPixelColor?: (vals: PixelVals<FacValue, FacType, Adm1Value>) => string;
    getPointColor?: (
      facValue: FacValue | undefined,
      facType: FacType | undefined
    ) => string;
    getPointStyle?: (
      facValue: FacValue | undefined,
      facType: FacType | undefined
    ) => PointStyle;
    getPointRadius?: (
      facValue: FacValue | undefined,
      facType: FacType | undefined
    ) => number;
    getPointStrokeWidth?: (
      facValue: FacValue | undefined,
      facType: FacType | undefined
    ) => number;
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
  const imageData = ctx.createImageData(opts.mapPixelW, opts.mapPixelH);

  const nPixels = data.pixPopUint8.length;
  const nFacilities = (data.facLocations?.length ?? 0) / 2;

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

  const colorMap: Record<string, [number, number, number]> = {};
  const resultsObject: ResutsObject = structuredClone(
    helpers.results?.startingObject ?? {}
  );

  for (let iPix = 0; iPix < data.pixPopUint8.length; iPix++) {
    if (data.pixPopUint8[iPix] === 255) {
      continue;
    }
    const nearestFacNumber = data.pixNearestFacNumber?.[iPix];
    if (
      nearestFacNumber &&
      (nearestFacNumber < 1 || nearestFacNumber > nFacilities)
    ) {
      throw new Error("Bad nearest fac number");
    }
    const { facValue, facType } = getFacValueAndType(data, nearestFacNumber);
    const vals: PixelVals<FacValue, FacType, Adm1Value> = {
      popFloat32: data.pixPopFloat32?.[iPix],
      adm1Index: data.pixAdm1Index?.[iPix],
      nearestFacDistance: data.pixNearestFacDistance?.[iPix],
      nearestFacValue: facValue,
      nearestFacType: facType,
    };
    const color = helpers.getPixelColor?.(vals) ?? opts.pixelColor ?? "#000000";
    if (!colorMap[color]) {
      colorMap[color] = chroma(color).rgba();
    }
    const rgb = colorMap[color];
    const iImgData = iPix * 4;
    imageData.data[iImgData + 0] = rgb[0];
    imageData.data[iImgData + 1] = rgb[1];
    imageData.data[iImgData + 2] = rgb[2];
    imageData.data[iImgData + 3] = data.pixPopUint8[iPix];
    helpers.results?.popAccumulator(resultsObject, vals);
  }

  ctx.putImageData(imageData, opts.mapPixelPad, opts.mapPixelPad);

  if (data.facLocations) {
    for (let iFac = 0; iFac < nFacilities; iFac++) {
      const facX = data.facLocations[iFac * 2];
      const facY = data.facLocations[iFac * 2 + 1];
      const facValue = data.facValues?.[iFac];
      const facType = data.facTypes?.[iFac];
      addPoint(
        ctx,
        helpers.getPointStyle?.(facValue, facType) ??
          opts.pointStyle ??
          "circle",
        facX + opts.mapPixelPad,
        facY + opts.mapPixelPad,
        helpers.getPointRadius?.(facValue, facType) ?? opts.pointRadius ?? 10,
        helpers.getPointColor?.(facValue, facType) ??
          opts.pointColor ??
          "#000000",
        opts.pointStrokeWidth ?? 3,
        chroma
      );
      helpers.results?.facAccumulator(resultsObject, facValue, facType);
    }
  }

  return resultsObject;
}

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

function getFacValueAndType<
  FacValue,
  FacType extends number | string,
  Adm1Value
>(
  data: RenderMapData<FacValue, FacType, Adm1Value>,
  nearestFacNumber: number | undefined
): { facValue: FacValue | undefined; facType: FacType | undefined } {
  if (nearestFacNumber === undefined) {
    return { facValue: undefined, facType: undefined };
  }
  const facValue = data.facValues?.[nearestFacNumber - 1];
  const facType = data.facTypes?.[nearestFacNumber - 1];
  return { facValue, facType };
}
