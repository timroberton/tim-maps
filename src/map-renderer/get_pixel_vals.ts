import { PixelVals, TimMapData } from "./types.ts";

export function getPixelVals<FacValue, FacType, Adm1Value, Adm2Value>(
  data: TimMapData<FacValue, FacType, Adm1Value, Adm2Value>,
  iPixInOriginal: number
): PixelVals<FacValue, FacType, Adm1Value> {
  const hasAdm1Number =
    data.adm1 && data.adm1.pixAdm1Number[iPixInOriginal] !== 0;
  const adm1Index = hasAdm1Number
    ? data.adm1!.pixAdm1Number[iPixInOriginal] - 1
    : undefined;

  if (!data.facs || !data.facs.facLinks) {
    return {
      popFloat32: data.pixPopFloat32?.[iPixInOriginal],
      adm1Index,
      nearestFacs: [],
      adm1Value:
        adm1Index !== undefined
          ? data.adm1?.adm1Values?.[adm1Index]
          : undefined,
    };
  }
  const nearestFacs: (
    | {
        facIndex: number;
        facDistance: number;
        facValue: FacValue | undefined;
        facType: FacType | undefined;
      }
    | "nofac"
  )[] = [];
  for (let i_f = 0; i_f < data.facs.facLinks.strideNearestFacs; i_f++) {
    const iInNearest: number =
      iPixInOriginal * data.facs.facLinks.strideNearestFacs + i_f;
    const hasFacNumber =
      data.facs.facLinks.pixNearestFacNumber !== undefined &&
      data.facs.facLinks.pixNearestFacNumber[iInNearest] !== -9999;
    if (!hasFacNumber) {
      nearestFacs.push("nofac");
      continue;
    }
    const facIndex = data.facs.facLinks.pixNearestFacNumber[iInNearest] - 1;
    nearestFacs.push({
      facIndex,
      facDistance: data.facs.facLinks.pixNearestFacDistance[iInNearest],
      facValue: data.facs.facValues?.[facIndex],
      facType: data.facs.facTypes?.[facIndex],
    });
  }
  return {
    popFloat32: data.pixPopFloat32?.[iPixInOriginal],
    // Linked facs
    nearestFacs,
    // Adm 1
    adm1Index,
    adm1Value:
      adm1Index !== undefined ? data.adm1?.adm1Values?.[adm1Index] : undefined,
  };
}
