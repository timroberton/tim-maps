import {
  _FILENAME_POP_FINAL_SCALED_TIF,
  _FILENAME_POP_UNCOMPRESSED_TIF,
} from "./consts.ts";
import { Meta } from "./types.ts";
import { getOutputGlobalsPath } from "./util_funcs.ts";

export function getMainRScriptForAdm0ScaledTif(meta: Meta) {
  const globalsPath = getOutputGlobalsPath(meta);
  return `
library(raster)
library(rgdal)
library(jsonlite)

adm0_original_tif <- raster("${globalsPath}/${_FILENAME_POP_UNCOMPRESSED_TIF}")

${
  meta.popTiffCrop
    ? `adm0_original_tif <- crop(x = adm0_original_tif, y = extent(${meta.popTiffCrop.WestBound}, ${meta.popTiffCrop.EastBound}, ${meta.popTiffCrop.SouthBound}, ${meta.popTiffCrop.NorthBound}))`
    : ""
}

adm0_trimmed_tif <- trim(adm0_original_tif, values = NA)


${
  meta.popTiffScale.direction === "none"
    ? "scaled_tif_for_adm0 <- adm0_trimmed_tif"
    : meta.popTiffScale.direction === "decreaseResolution"
    ? `scaled_tif_for_adm0 <- aggregate(adm0_trimmed_tif, fact=${meta.popTiffScale.factor}, fun=sum)`
    : `scaled_tif_for_adm0 <- disaggregate(adm0_trimmed_tif, fact=${
        meta.popTiffScale.factor
      }) / ${meta.popTiffScale.factor * meta.popTiffScale.factor}`
}
filePathRaster <- file.path("${globalsPath}/${_FILENAME_POP_FINAL_SCALED_TIF}")
writeRaster(scaled_tif_for_adm0, filePathRaster)

${
  meta.adm1
    ? `adm1_shp <- readOGR("${meta.inputDirAbsolutePath}/${meta.adm1.shpRelativePath}")
write.csv(adm1_shp, "${globalsPath}/adm1_features.csv")`
    : ""
}

${
  meta.adm2
    ? `adm2_shp <- readOGR("${meta.inputDirAbsolutePath}/${meta.adm2.shpRelativePath}")
write.csv(adm2_shp, "${globalsPath}/adm2_features.csv")`
    : ""
}
  
  `;
}
