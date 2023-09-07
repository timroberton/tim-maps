import { TimMapData } from "./deps.ts";
import { MapFiles } from "./types.ts";

export function getMapDataFromFiles<FacValue, FacType, Adm1Value>(
  mapFiles: MapFiles,
  facValues: FacValue[] | undefined,
  facTypes: FacType[] | undefined,
  adm1Values: Adm1Value[] | undefined
): TimMapData<FacValue, FacType, Adm1Value> {
  const mapData: TimMapData<FacValue, FacType, Adm1Value> = {
    pixW: mapFiles.dataPackage.popRasterDimensions.pixelW,
    pixH: mapFiles.dataPackage.popRasterDimensions.pixelH,
    pixPopUint8: mapFiles.pop_uint8,
    pixPopFloat32: mapFiles.pop_float32,
    // Facs
    facs: mapFiles.facs
      ? {
          facLocations: mapFiles.facs.facilities_int32,
          facValues,
          facTypes,
          // Linked
          facLinks: mapFiles.facs.facLinks
            ? {
                pixNearestFacNumber: mapFiles.facs.facLinks.nearest_int16,
                pixNearestFacDistance: mapFiles.facs.facLinks.distance_float32,
                nNearestVals: mapFiles.dataPackage.facilitiesInfo.nNearestVals,
              }
            : undefined,
        }
      : undefined,
    // Adm1
    adm1: mapFiles.adm1_uint8
      ? {
          pixAdm1Number: mapFiles.adm1_uint8,
          adm1Values,
        }
      : undefined,
  };
  return mapData;
}
