import { PixelVals, TimMapData } from "./types.ts";

export function getPixelVals<FacValue, FacType, Adm1Value>(
  data: TimMapData<FacValue, FacType, Adm1Value>,
  iPixInOriginal: number
): PixelVals<FacValue, FacType, Adm1Value> {
  const nearestFacIndex = data.pixNearestFacNumber
    ? data.pixNearestFacNumber[iPixInOriginal] - 1
    : undefined;
  const adm1Index = data.pixAdm1Number
    ? data.pixAdm1Number[iPixInOriginal] - 1
    : undefined;
  return {
    popFloat32: data.pixPopFloat32?.[iPixInOriginal],
    // Fac
    nearestFacIndex,
    nearestFacDistance: data.pixNearestFacDistance?.[iPixInOriginal],
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
}
