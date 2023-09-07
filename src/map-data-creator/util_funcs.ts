import {
  _FILENAME_DATAPACKAGE_TEMP_POPDIMENSIONS,
  _GLOBAL_FOLDER,
} from "./consts.ts";
import { PopDimensions } from "./deps.ts";
import { Meta } from "./types.ts";

export async function getPopDimensions(
  subFolderPath: string
): Promise<PopDimensions> {
  try {
    const popDimensionsStr = await Deno.readTextFile(
      `${subFolderPath}/${_FILENAME_DATAPACKAGE_TEMP_POPDIMENSIONS}`
    );
    return JSON.parse(popDimensionsStr);
  } catch {
    throw new Error("Couldn't get pop dimensions json file");
  }
}

export function getOutputGlobalsPath(meta: Meta) {
  return `${meta.outputDirAbsolutePath}/${_GLOBAL_FOLDER}`;
}

export function getOutputSubFolderPath(meta: Meta, subFolder: string) {
  return `${meta.outputDirAbsolutePath}/${subFolder}`;
}
