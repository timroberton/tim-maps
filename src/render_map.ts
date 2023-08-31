import { addPoint } from "./add_points.ts";
import { Canvas, chroma } from "./deps.ts";
import { TimMapData, RenderMapConfig, PixelVals, FacVals } from "./types.ts";

export function renderMap<
  FacValue,
  FacType extends number | string,
  Adm1Value,
  ResutsObject
>(
  canvas: Canvas,
  chroma: chroma,
  data: TimMapData<FacValue, FacType, Adm1Value>,
  config: RenderMapConfig<FacValue, FacType, Adm1Value, ResutsObject>
): ResutsObject | undefined {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const imageData = ctx.createImageData(config.mapPixelW, config.mapPixelH);

  const nPixels = data.pixPopUint8.length;
  const nFacilities = (data.facLocations?.length ?? 0) / 2;
  const pixelPad = config.mapPixelPad ?? 0;

  const colorMap: Record<string, [number, number, number]> = {};
  const resultsObject: ResutsObject = structuredClone(
    config.results?.startingObject ?? {}
  );

  ////////////////////////////////////
  //////////// Validation ////////////
  ////////////////////////////////////
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
    if (
      data.pixNearestFacNumber &&
      data.pixNearestFacNumber.length !== nPixels
    ) {
      throw new Error("pixNearestFacNumber not equal to pixPopUint8");
    }
    if (
      data.pixNearestFacDistance &&
      data.pixNearestFacDistance.length !== nPixels
    ) {
      throw new Error("pixNearestFacDistance not equal to pixPopUint8");
    }
    // if (!config.getPixelColor && config.pixelColor === undefined) {
    //   throw new Error("At least one pixelColor opt needs to be defined");
    // }
    // if (!config.getPointColor && config.pointColor === undefined) {
    //   throw new Error("At least one pointColor opt needs to be defined");
    // }
    // if (!config.getPointStyle && config.pointStyle === undefined) {
    //   throw new Error("At least one pointStyle opt needs to be defined");
    // }
    // if (!config.getPointRadius && config.pointRadius === undefined) {
    //   throw new Error("At least one pointRadius opt needs to be defined");
    // }
    // if (!config.getPointStrokeWidth && config.pointStrokeWidth === undefined) {
    //   throw new Error("At least one pointStrokeWidth opt needs to be defined");
    // }
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
    const adm1Index = data.pixAdm1Number
      ? data.pixAdm1Number[iPix] - 1
      : undefined;
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
      adm1Index,
      adm1Value:
        adm1Index !== undefined ? data.adm1Values?.[adm1Index] : undefined,
    };
    const color = config.getPixelColor?.(vals);
    //  ?? config.pixelColor ?? "#000000";
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
      const vals: FacVals<FacValue, FacType> = {
        facValue: data.facValues?.[iFac],
        facType: data.facTypes?.[iFac],
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
