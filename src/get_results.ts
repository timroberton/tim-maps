import {
  FacVals,
  GetResultsConfig,
  PixelVals,
  TimMapData,
  TimMapResults,
} from "./types.ts";

export function getResults<
  FacValue,
  FacType extends number | string,
  Adm1Value,
  ResutsObject
>(
  data: TimMapData<FacValue, FacType, Adm1Value>,
  results: TimMapResults<FacValue, FacType, Adm1Value, ResutsObject>,
  config?: GetResultsConfig
): ResutsObject {
  const nPixels = data.pixPopUint8.length;

  const resultsObject: ResutsObject = structuredClone(
    results.startingObject ?? {}
  );

  ////////////////////////////////////
  //////////// Validation ////////////
  ////////////////////////////////////
  if (config?.validate !== false) {
    if (data.pixPopFloat32 && data.pixPopFloat32.length !== nPixels) {
      throw new Error("pixPopFloat32 not same length as pixPopUint8");
    }
    if (
      data.facValues &&
      data.facTypes &&
      data.facValues.length !== data.facTypes.length
    ) {
      throw new Error("facValues not equal to facTypes");
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
    results.popAccumulator?.(resultsObject, vals);
  }

  if (data.facValues || data.facTypes) {
    const nFacilities = data.facValues?.length ?? data.facTypes?.length ?? 0;
    for (let iFac = 0; iFac < nFacilities; iFac++) {
      const vals: FacVals<FacValue, FacType> = {
        facValue: data.facValues?.[iFac],
        facType: data.facTypes?.[iFac],
      };
      results.facAccumulator?.(resultsObject, vals);
    }
  }

  return resultsObject;
}
