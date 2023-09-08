import { DataPackage } from "./deps.ts";
import { MapFiles } from "./types.ts";
import {
  fetchFloat32File,
  fetchInt16File,
  fetchInt32File,
  fetchJsonFile,
  fetchUint8File,
} from "./util_funcs.ts";

export async function fetchMapFiles(
  url: string,
  updateProgress?: (pct: number) => void
): Promise<MapFiles> {
  updateProgress?.(0.1);
  console.log(url);
  const dataPackage = await fetchJsonFile<DataPackage>(
    url,
    "data_package.json"
  );
  if (!dataPackage || !dataPackage.files) {
    throw new Error(
      "Map file read error: Must have dataPackage with file listing"
    );
  }
  updateProgress?.(0.2);
  const pop_uint8 = dataPackage.files.includes("pop_uint8.bin")
    ? await fetchUint8File(url, "pop_uint8.bin")
    : undefined;
  updateProgress?.(0.3);
  const pop_float32 = dataPackage.files.includes("pop_float32.bin")
    ? await fetchFloat32File(url, "pop_float32.bin")
    : undefined;
  updateProgress?.(0.4);
  const facilities_int32 = dataPackage.files.includes("facilities_int32.bin")
    ? await fetchInt32File(url, "facilities_int32.bin")
    : undefined;
  updateProgress?.(0.5);
  const nearest_int16 = dataPackage.files.includes("nearest_int16.bin")
    ? await fetchInt16File(url, "nearest_int16.bin")
    : undefined;
  updateProgress?.(0.6);
  const distance_float32 = dataPackage.files.includes("distance_float32.bin")
    ? await fetchFloat32File(url, "distance_float32.bin")
    : undefined;
  updateProgress?.(0.7);
  const adm1_uint8 = dataPackage.files.includes("adm1_uint8.bin")
    ? await fetchUint8File(url, "adm1_uint8.bin")
    : undefined;
  updateProgress?.(0.8);
  const adm2_uint8 = dataPackage.files.includes("adm2_uint8.bin")
    ? await fetchUint8File(url, "adm2_uint8.bin")
    : undefined;
  updateProgress?.(0.9);
  const facilityInfo = dataPackage.files.includes("facility_info.json")
    ? await fetchJsonFile<unknown[]>(url, "facility_info.json")
    : undefined;
  updateProgress?.(1);

  if (!pop_uint8) {
    throw new Error("Map file read error: Must have pop_uint8");
  }
  if (nearest_int16 && !facilities_int32) {
    throw new Error(
      "Map file read error: Can't have nearest without facilities"
    );
  }
  if (distance_float32 && !facilities_int32) {
    throw new Error(
      "Map file read error: Can't have distance without facilities"
    );
  }
  if (nearest_int16 && !distance_float32) {
    throw new Error("Map file read error: Can't have nearest without nearest");
  }
  if (distance_float32 && !nearest_int16) {
    throw new Error("Map file read error: Can't have distance without nearest");
  }

  const mapFiles: MapFiles = {
    dataPackage,
    pop_uint8,
    pop_float32,
    facs: facilities_int32
      ? {
          facilities_int32,
          facLinks:
            nearest_int16 && distance_float32
              ? {
                  nearest_int16,
                  distance_float32,
                }
              : undefined,
          facilityInfo,
        }
      : undefined,
    adm1_uint8,
    adm2_uint8,
  };
  return mapFiles;
}
