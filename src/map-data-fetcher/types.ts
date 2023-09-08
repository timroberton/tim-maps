import { DataPackage } from "./deps.ts";
import { TimMapData } from "./deps.ts";

export type MapFiles = {
  dataPackage: DataPackage;
  pop_uint8: Uint8Array;
  pop_float32?: Float32Array;
  facs?: {
    facilities_int32: Int32Array;
    facLinks?: {
      nearest_int16: Int16Array;
      distance_float32: Float32Array;
    };
    facilityInfo?: any[];
  };
  adm1_uint8?: Uint8Array;
  adm2_uint8?: Uint8Array;
};

export declare function fetchMapFiles(
  url: string,
  updateProgress?: (pct: number) => void
): Promise<MapFiles>;

export declare function getMapDataFromFiles<
  FacValue,
  FacType,
  Adm1Value,
  Adm2Value
>(
  mapFiles: MapFiles,
  valueFileOverrides: {
    facValuesOverride?: FacValue[];
    facTypesOverride?: FacType[];
    adm1ValuesOverride?: Adm1Value[];
    adm2ValuesOverride?: Adm2Value[];
  }
): TimMapData<FacValue, FacType, Adm1Value, Adm2Value>;
