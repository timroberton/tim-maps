import { TimMapData } from "./deps.ts";
import { MapFiles } from "./types.ts";

export function getMapDataFromFiles<FacValue, FacType, Adm1Value, Adm2Value>(
  mapFiles: MapFiles,
  valueFileOverrides: {
    facValuesOverride?: FacValue[];
    facTypesOverride?: FacType[];
    adm1ValuesOverride?: Adm1Value[];
    adm2ValuesOverride?: Adm2Value[];
  }
): TimMapData<FacValue, FacType, Adm1Value, Adm2Value> {
  const mapData: TimMapData<FacValue, FacType, Adm1Value, Adm2Value> = {
    pixW: mapFiles.dataPackage.popRasterDimensions.pixelW,
    pixH: mapFiles.dataPackage.popRasterDimensions.pixelH,
    pixPopUint8: mapFiles.pop_uint8,
    pixPopFloat32: mapFiles.pop_float32,
    // Facs
    facs: mapFiles.facs
      ? {
          facLocations: mapFiles.facs.facilities_int32,
          facValues:
            valueFileOverrides.facValuesOverride ?? mapFiles.facs.facilityInfo,
          facTypes: valueFileOverrides.facTypesOverride,
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
          adm1Values: valueFileOverrides.adm1ValuesOverride,
        }
      : undefined,
    // Adm2
    adm2: mapFiles.adm2_uint8
      ? {
          pixAdm2Number: mapFiles.adm2_uint8,
          adm2Values: valueFileOverrides.adm2ValuesOverride,
        }
      : undefined,
  };
  return mapData;
}
