import { DataPackage } from "./deps.ts";
import { MapFiles } from "./types.ts";
import {
  readFloat32File,
  readInt16File,
  readInt32File,
  readJsonFile,
  readUint8File,
} from "./util_funcs.ts";

export async function readMapFiles(dir: string): Promise<MapFiles> {
  console.log("Reading map files from", dir);
  const dataPackage = await readJsonFile<DataPackage>(dir, "data_package.json");
  if (!dataPackage || !dataPackage.files) {
    throw new Error(
      "Map file read error: Must have dataPackage with file listing"
    );
  }
  const pop_uint8 = dataPackage.files.includes("pop_uint8.bin")
    ? await readUint8File(dir, "pop_uint8.bin")
    : undefined;
  const pop_float32 = dataPackage.files.includes("pop_float32.bin")
    ? await readFloat32File(dir, "pop_float32.bin")
    : undefined;
  const facilities_int32 = dataPackage.files.includes("facilities_int32.bin")
    ? await readInt32File(dir, "facilities_int32.bin")
    : undefined;
  const nearest_int16 = dataPackage.files.includes("nearest_int16.bin")
    ? await readInt16File(dir, "nearest_int16.bin")
    : undefined;
  const distance_float32 = dataPackage.files.includes("distance_float32.bin")
    ? await readFloat32File(dir, "distance_float32.bin")
    : undefined;
  const adm1_uint8 = dataPackage.files.includes("adm1_uint8.bin")
    ? await readUint8File(dir, "adm1_uint8.bin")
    : undefined;
  const adm2_uint8 = dataPackage.files.includes("adm2_uint8.bin")
    ? await readUint8File(dir, "adm2_uint8.bin")
    : undefined;
  const facilityInfo = dataPackage.files.includes("facility_info.json")
    ? await readJsonFile<unknown[]>(dir, "facility_info.json")
    : undefined;

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
