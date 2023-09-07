import { PixelVals, TimMapData } from "./types.ts";

export function getPixelVals<FacValue, FacType, Adm1Value>(
  data: TimMapData<FacValue, FacType, Adm1Value>,
  iPixInOriginal: number
): PixelVals<FacValue, FacType, Adm1Value> {
  const hasAdm1Number =
    data.pixAdm1Number !== undefined &&
    data.pixAdm1Number[iPixInOriginal] !== 0;
  const adm1Index = hasAdm1Number
    ? data.pixAdm1Number![iPixInOriginal] - 1
    : undefined;

  if (!data.linkedFacs) {
    return {
      popFloat32: data.pixPopFloat32?.[iPixInOriginal],
      adm1Index,
      nearestFacs: [],
      adm1Value:
        adm1Index !== undefined ? data.adm1Values?.[adm1Index] : undefined,
    };
  }
  const nearestFacs: (
    | {
        facIndex: number;
        facDistance: number;
        facValue?: FacValue;
        facType?: FacType;
      }
    | "nofac"
  )[] = [];
  for (let i_f = 0; i_f < data.linkedFacs.nNearestVals; i_f++) {
    const iInNearest: number =
      iPixInOriginal * data.linkedFacs.nNearestVals + i_f;
    const hasFacNumber =
      data.linkedFacs.pixNearestFacNumber !== undefined &&
      data.linkedFacs.pixNearestFacNumber[iInNearest] !== -9999;
    if (!hasFacNumber) {
      nearestFacs.push("nofac");
      continue;
    }
    const facIndex = data.linkedFacs.pixNearestFacNumber[iInNearest] - 1;
    nearestFacs.push({
      facIndex,
      facDistance: data.linkedFacs.pixNearestFacDistance[iInNearest],
      facValue: data.facValues?.[facIndex],
      facType: data.facTypes?.[facIndex],
    });
  }
  return {
    popFloat32: data.pixPopFloat32?.[iPixInOriginal],
    // Linked facs
    nearestFacs,
    // Adm 1
    adm1Index,
    adm1Value:
      adm1Index !== undefined ? data.adm1Values?.[adm1Index] : undefined,
  };
}
