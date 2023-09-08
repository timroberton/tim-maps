import { addPoint } from "./add_points.ts";
import type { Canvas, chroma } from "./deps.ts";
import { getPixelVals } from "./get_pixel_vals.ts";
import { FacVals, PixelVals, RenderMapConfig, TimMapData } from "./types.ts";

export function renderMap<
  FacValue,
  FacType,
  Adm1Value,
  Adm2Value,
  ResutsObject
>(
  canvas: Canvas | undefined,
  chroma: chroma | undefined,
  data: TimMapData<FacValue, FacType, Adm1Value, Adm2Value>,
  config: RenderMapConfig<FacValue, FacType, Adm1Value, Adm2Value, ResutsObject>
): ResutsObject | undefined {
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
  const colorMap: Record<string, [number, number, number]> = {};
  const resultsObject: ResutsObject = structuredClone(
    config.results?.startingObject ?? {}
  );

  ////////////////////////////////////
  //////////// Validation ////////////
  ////////////////////////////////////
  if (config.validate !== false) {
    if (data.pixPopUint8.length < nCroppedPixels) {
      throw new Error("pixPopUint8 is not large enough to cover area");
    }
    if (
      data.pixPopFloat32 &&
      data.pixPopFloat32.length !== data.pixPopUint8.length
    ) {
      throw new Error("pixPopFloat32 not same length as pixPopUint8");
    }
    if (data.facs) {
      if (data.facs.facValues && data.facs.facValues.length !== nFacilities) {
        throw new Error("facLocations not twice the length of facValues");
      }
      if (data.facs.facLinks) {
        if (
          data.facs.facLinks.pixNearestFacNumber.length !==
          data.pixPopUint8.length * data.facs.facLinks.nNearestVals
        ) {
          throw new Error("pixNearestFacNumber not equal to pixPopUint8");
        }
        if (
          data.facs.facLinks.pixNearestFacDistance.length !==
          data.pixPopUint8.length * data.facs.facLinks.nNearestVals
        ) {
          throw new Error("pixNearestFacDistance not equal to pixPopUint8");
        }
        let minFacNumber = Number.POSITIVE_INFINITY;
        let maxFacNumber = Number.NEGATIVE_INFINITY;
        data.facs.facLinks.pixNearestFacNumber.forEach((v) => {
          minFacNumber = Math.min(v, minFacNumber);
          maxFacNumber = Math.max(v, maxFacNumber);
        });
        if (minFacNumber !== -9999) {
          if (minFacNumber < 1 || minFacNumber > nFacilities) {
            throw new Error(`Bad nearest fac index - min is ${minFacNumber}`);
          }
        }
        if (maxFacNumber !== -9999) {
          if (maxFacNumber < 1 || maxFacNumber > nFacilities) {
            throw new Error(`Bad nearest fac index - max is ${maxFacNumber}`);
          }
        }
      }
    }
    if (data.adm1 && data.adm1.adm1Values) {
      const nAdm1s = data.adm1.adm1Values.length;
      let minAdm1Index = Number.POSITIVE_INFINITY;
      let maxAdm1Index = Number.NEGATIVE_INFINITY;
      data.adm1.pixAdm1Number.forEach((v) => {
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
  ////////////////////////////////////
  ////////////////////////////////////
  ////////////////////////////////////
  let i = -1;
  for (let y = 0; y < croppedPixelH; y++) {
    for (let x = 0; x < croppedPixelW; x++) {
      i += 1;
      const iPixInSmallerCroppedImage = x + y * croppedPixelW;
      if (i !== iPixInSmallerCroppedImage) {
        throw new Error();
      }
      const iPixInOriginal =
        x + croppedPixelX + (y + croppedPixelY) * data.pixW;
      if (data.pixPopUint8[iPixInOriginal] === 255) {
        continue;
      }
      const vals: PixelVals<FacValue, FacType, Adm1Value> = getPixelVals(
        data,
        iPixInOriginal
      );
      if (config.filterPixels && !config.filterPixels(vals)) {
        continue;
      }
      config.results?.popAccumulator?.(resultsObject, vals);
      if (imageData) {
        const color =
          config.getPixelColor?.(vals) ?? config.pixelColor ?? "#000000";
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
      if (
        facX < croppedPixelX ||
        facX >= croppedPixelX + croppedPixelW ||
        facY < croppedPixelY ||
        facY >= croppedPixelY + croppedPixelH
      ) {
        continue;
      }
      const iPixInOriginal = facX + facY * data.pixW;
      const pixelVals: PixelVals<FacValue, FacType, Adm1Value> = getPixelVals(
        data,
        iPixInOriginal
      );
      const facVals: FacVals<FacValue, FacType> = {
        facValue: data.facs.facValues?.[iFac],
        facType: data.facs.facTypes?.[iFac],
      };
      if (config.filterFacs && !config.filterFacs(facVals, pixelVals)) {
        continue;
      }
      config.results?.facAccumulator?.(resultsObject, facVals, pixelVals);
      if (ctx) {
        addPoint(
          ctx,
          config.getPointStyle?.(facVals, pixelVals) ??
            config.pointStyle ??
            "circle",
          facX + pixelPad - croppedPixelX,
          facY + pixelPad - croppedPixelY,
          config.getPointRadius?.(facVals, pixelVals) ??
            config.pointRadius ??
            10,
          config.getPointColor?.(facVals, pixelVals) ??
            config.pointColor ??
            "#000000",
          config.pointStrokeWidth ?? 3,
          chroma
        );
      }
    }
  }

  return resultsObject;
}
