import {
  _FILENAME_DATAPACKAGE,
  _FILENAME_DATAPACKAGE_TEMP_ADM,
  _FILENAME_DATAPACKAGE_TEMP_FACILITIESINFO,
  _FILENAME_DATAPACKAGE_TEMP_POPDIMENSIONS,
  _FILENAME_FACILITY_INFO,
  _FILENAME_FRONTEND_ADM1_BIN,
  _FILENAME_FRONTEND_ADM2_BIN,
  _FILENAME_FRONTEND_DISTANCE_FLOAT32_FAC_BIN,
  _FILENAME_FRONTEND_FACILITIES_INT32_BIN,
  _FILENAME_FRONTEND_NEAREST_INT16_BIN,
  _FILENAME_FRONTEND_POP_FLOAT32_BIN,
  _FILENAME_FRONTEND_POP_UINT8_BIN,
} from "./consts.ts";
import {
  AdmInfo,
  DataPackage,
  FacilitiesInfo,
  PopDimensions,
} from "./types.ts";
import { getOutputSubFolderPath } from "./util_funcs.ts";
import { Meta } from "./types.ts";

export async function makeDataPackage(meta: Meta, subFolder: string) {
  const subFolderPath = getOutputSubFolderPath(meta, subFolder);
  const popRasterDimensions: PopDimensions = JSON.parse(
    await Deno.readTextFile(
      `${subFolderPath}/${_FILENAME_DATAPACKAGE_TEMP_POPDIMENSIONS}`
    )
  );
  const admInfo: AdmInfo = JSON.parse(
    await Deno.readTextFile(
      `${subFolderPath}/${_FILENAME_DATAPACKAGE_TEMP_ADM}`
    )
  );
  const facilitiesInfo: FacilitiesInfo = JSON.parse(
    await Deno.readTextFile(
      `${subFolderPath}/${_FILENAME_DATAPACKAGE_TEMP_FACILITIESINFO}`
    )
  );

  const files = [
    _FILENAME_FRONTEND_POP_UINT8_BIN,
    _FILENAME_FRONTEND_POP_FLOAT32_BIN,
    _FILENAME_FRONTEND_FACILITIES_INT32_BIN,
    _FILENAME_FRONTEND_NEAREST_INT16_BIN,
    _FILENAME_FRONTEND_DISTANCE_FLOAT32_FAC_BIN,
  ];
  if (admInfo.hasAdm1) {
    files.push(_FILENAME_FRONTEND_ADM1_BIN);
  }
  if (admInfo.hasAdm2) {
    files.push(_FILENAME_FRONTEND_ADM2_BIN);
  }
  if (facilitiesInfo.facilityInfoHasBeenIncluded) {
    files.push(_FILENAME_FACILITY_INFO);
  }

  const dataPackage: DataPackage = {
    popRasterDimensions: {
      pixelW: popRasterDimensions.scaledPixels[1],
      pixelH: popRasterDimensions.scaledPixels[0],
      nPixels: popRasterDimensions.nRows,
      geoExtent: popRasterDimensions.scaledExtent,
    },
    admInfo,
    facilitiesInfo,
    files,
  };
  await Deno.writeTextFile(
    `${subFolderPath}/${_FILENAME_DATAPACKAGE}`,
    JSON.stringify(dataPackage, null, 2)
  );
}
