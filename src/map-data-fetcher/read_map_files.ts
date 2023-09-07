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
  const dataPackage = await readJsonFile<DataPackage>(dir, "data_package.json");
  const pop_uint8 = await readUint8File(dir, "pop_uint8.bin");
  const pop_float32 = await readFloat32File(dir, "pop_float32.bin");
  const facilities_int32 = await readInt32File(dir, "facilities_int32.bin");
  const nearest_int16 = await readInt16File(dir, "nearest_int16.bin");
  const distance_float32 = await readFloat32File(dir, "distance_float32.bin");
  const adm1_uint8 = await readUint8File(dir, "adm1_uint8.bin");
  const adm2_uint8 = await readUint8File(dir, "adm1_uint8.bin");

  if (!dataPackage) {
    throw new Error("Map file read error: Must have dataPackage");
  }
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
        }
      : undefined,
    adm1_uint8,
    adm2_uint8,
  };
  return mapFiles;
}
