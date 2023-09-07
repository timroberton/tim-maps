import { _FILENAME_POP_UNCOMPRESSED_TIF } from "./consts.ts";
import { Meta } from "./types.ts";
import { getOutputGlobalsPath } from "./util_funcs.ts";

export function getGDalScript(meta: Meta) {
  const globalsPath = getOutputGlobalsPath(meta);
  return `#!/bin/sh

  gdal_translate ${meta.inputDirAbsolutePath}/${meta.popTiffRelativePath} ${globalsPath}/${_FILENAME_POP_UNCOMPRESSED_TIF} -co COMPRESS=NONE
  
  gdalinfo -json ${globalsPath}/${_FILENAME_POP_UNCOMPRESSED_TIF} > ${globalsPath}/pop_gdal_info.json
  
  `;
}
