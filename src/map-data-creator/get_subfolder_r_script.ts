import {
  _FILENAME_DATAPACKAGE_TEMP_POPDIMENSIONS,
  _FILENAME_FRONTEND_ADM1_BIN_UNCHECKED,
  _FILENAME_FRONTEND_ADM2_BIN_UNCHECKED,
  _FILENAME_FRONTEND_POP_FLOAT32_BIN,
  _FILENAME_FRONTEND_POP_UINT8_BIN,
  _FILENAME_POP_FINAL_SCALED_TIF,
} from "./consts.ts";
import { AdmSelection, Meta } from "./types.ts";
import { getOutputGlobalsPath } from "./util_funcs.ts";

export function getSubFolderRScript(
  meta: Meta,
  subFolderPath: string,
  admSelection: AdmSelection
) {
  const globalsPath = getOutputGlobalsPath(meta);
  return `
library(raster)
library(rgdal)
library(jsonlite)
  
${
  admSelection.level === "adm0"
    ? `current_tif <- raster("${globalsPath}/${_FILENAME_POP_FINAL_SCALED_TIF}")`
    : `
scaled_tif_for_adm0 <- raster("${globalsPath}/${_FILENAME_POP_FINAL_SCALED_TIF}")

adm_shp <- readOGR("${meta.inputDirAbsolutePath}/${
        admSelection.level === "adm1"
          ? meta.adm1!.shpRelativePath
          : meta.adm2!.shpRelativePath
      }")
shp <- adm_shp[${admSelection.featureNumber}, ]
adm_featureX_tif <- crop(x = scaled_tif_for_adm0, y = shp)

adm0_dims <- dim(scaled_tif_for_adm0)
adm1_featureX_dims <- dim(adm_featureX_tif)
scaleFactor <- floor(adm0_dims[2] / adm1_featureX_dims[2])

adm_featureX_tif_scaled <- disaggregate(adm_featureX_tif, fact=scaleFactor) / (scaleFactor * scaleFactor)

current_tif <- mask(x = adm_featureX_tif_scaled, mask = shp)
  `
}

values <- getValues(current_tif)
values[is.na(values)] = -9999
filePathPopFloat32 <- file.path("${subFolderPath}/${_FILENAME_FRONTEND_POP_FLOAT32_BIN}")
writeBin(values, filePathPopFloat32, size = 4)

filePathJson <- file.path("${subFolderPath}/${_FILENAME_DATAPACKAGE_TEMP_POPDIMENSIONS}")
write_json(list(scaledPixels=dim(current_tif), scaledExtent=as.list(extent(current_tif)), nRows=unbox(length(values))), filePathJson)

pop_bin <- ifelse(values == -9999, -9999, log(values + 1))
pop_bin_max <- max(pop_bin)
pop_bin <- as.integer(ifelse(pop_bin == -9999, 255, floor(254 * (pop_bin / pop_bin_max))))
filePathPopUint8 <- file.path("${subFolderPath}/${_FILENAME_FRONTEND_POP_UINT8_BIN}")
writeBin(pop_bin, filePathPopUint8, size=1)


${
  meta.adm1
    ? `adm1_shp <- readOGR("${meta.inputDirAbsolutePath}/${meta.adm1.shpRelativePath}")
adm1_features_to_code <- adm1_shp[["${meta.adm1.featureColumnName}"]]
adm1_tif <- setValues(current_tif, 0)
i <- 0
for (feature_to_code in adm1_features_to_code) {
    i <- i+1
    shp <- adm1_shp[i, ]
    adm1_tif <- mask(x = adm1_tif, mask = shp, inverse=TRUE, updatevalue=i)
    print(paste0("Making admin file - finished feature ", i))
}
adm1_vals <- getValues(adm1_tif)
adm1_vals <- as.integer(adm1_vals)
filePath <- file.path("${subFolderPath}/${_FILENAME_FRONTEND_ADM1_BIN_UNCHECKED}")
writeBin(adm1_vals, filePath, size=1)`
    : ""
}


${
  meta.adm2
    ? `adm2_shp <- readOGR("${meta.inputDirAbsolutePath}/${meta.adm2.shpRelativePath}")
adm2_features_to_code <- adm2_shp[["${meta.adm2.featureColumnName}"]]
adm2_tif <- setValues(current_tif, 0)
i <- 0
for (feature_to_code in adm2_features_to_code) {
    i <- i+1
    shp <- adm2_shp[i, ]
    adm2_tif <- mask(x = adm2_tif, mask = shp, inverse=TRUE, updatevalue=i)
    print(paste0("Making admin file - finished feature ", i))
}
adm2_vals <- getValues(adm2_tif)
adm2_vals <- as.integer(adm2_vals)
filePath <- file.path("${subFolderPath}/${_FILENAME_FRONTEND_ADM2_BIN_UNCHECKED}")
writeBin(adm2_vals, filePath, size=1)`
    : ""
}


`;
}
