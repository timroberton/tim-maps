import { addPoint } from "./add_points.ts";
import {
  CanvasRenderingContext2D,
  ImageData,
  type Canvas,
  ChromaStatic,
} from "./deps.ts";
import { getPixelVals } from "./get_pixel_vals.ts";
import { FacVals, PixelVals, RenderMapConfig, TimMapData } from "./types.ts";

export async function renderMap<
  FacValue,
  FacType,
  Adm1Value,
  Adm2Value,
  ResutsObject
>(
  canvas: Canvas | undefined,
  chroma: ChromaStatic | undefined,
  data: TimMapData<FacValue, FacType, Adm1Value, Adm2Value>,
  config: RenderMapConfig<FacValue, FacType, Adm1Value, Adm2Value, ResutsObject>
): Promise<ResutsObject | undefined> {
  const nFacilities = (data.facs?.facLocations.length ?? 0) / 2;
  const pixelPad = Math.round(config.mapPixelPad ?? 0);
  const croppedPixelX = Math.round(config.crop?.x ?? 0);
  const croppedPixelY = Math.round(config.crop?.y ?? 0);
  const croppedPixelW = Math.round(config.crop?.w ?? data.pixW);
  const croppedPixelH = Math.round(config.crop?.h ?? data.pixH);

  const imageData = new ImageData(croppedPixelW, croppedPixelH);

  let ctx = null as CanvasRenderingContext2D | null;
  if (canvas) {
    canvas.width = Math.round(croppedPixelW + 2 * pixelPad); // These operations must come first before getting canvas!
    canvas.height = Math.round(croppedPixelH + 2 * pixelPad); // These operations must come first before getting canvas!
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  const nCroppedPixels = croppedPixelW * croppedPixelH;
  const colorMap: Record<string, [number, number, number, number]> = {};
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
          data.pixPopUint8.length * data.facs.facLinks.strideNearestFacs
        ) {
          throw new Error("pixNearestFacNumber not equal to pixPopUint8");
        }
        if (
          data.facs.facLinks.pixNearestFacDistance.length !==
          data.pixPopUint8.length * data.facs.facLinks.strideNearestFacs
        ) {
          throw new Error("pixNearestFacDistance not equal to pixPopUint8");
        }
        let minFacNumber = nFacilities + 1;
        let maxFacNumber = -1;
        let atLeastOneNearestFacility = false;
        data.facs.facLinks.pixNearestFacNumber.forEach((v) => {
          if (v === -9999) {
            return;
          }
          minFacNumber = Math.min(v, minFacNumber);
          maxFacNumber = Math.max(v, maxFacNumber);
          atLeastOneNearestFacility = true;
        });
        if (atLeastOneNearestFacility) {
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
      const vals: PixelVals<FacValue, FacType, Adm1Value, Adm2Value> =
        getPixelVals(data, iPixInOriginal);
      if (config.filterPixels && !config.filterPixels(vals)) {
        continue;
      }
      config.results?.popAccumulator?.(resultsObject, vals);
      if (canvas && ctx) {
        const color =
          config.getPixelColor?.(vals) ?? config.pixelColor ?? "#000000";
        const transparency =
          config.getPixelTransparency255?.(vals) ??
          config.pixelTransparency255 ??
          data.pixPopUint8[iPixInOriginal];
        if (!color || transparency === undefined || transparency % 1 !== 0) {
          throw new Error("What" + JSON.stringify(vals));
        }
        if (!colorMap[color] && chroma) {
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

  if (canvas && ctx) {
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
      const pixelVals: PixelVals<FacValue, FacType, Adm1Value, Adm2Value> =
        getPixelVals(data, iPixInOriginal);
      const facVals: FacVals<FacValue, FacType> = {
        facValue: data.facs.facValues?.[iFac],
        facType: data.facs.facTypes?.[iFac],
      };
      if (config.filterFacs && !config.filterFacs(facVals, pixelVals)) {
        continue;
      }
      config.results?.facAccumulator?.(resultsObject, facVals, pixelVals);
      if (canvas && ctx && chroma) {
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

  if (config.backgroundColor && canvas && ctx) {
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  return resultsObject;
}
