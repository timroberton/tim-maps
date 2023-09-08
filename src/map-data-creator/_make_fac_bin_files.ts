import {
  _FILENAME_DATAPACKAGE_TEMP_FACILITIESINFO,
  _FILENAME_FACILITY_INFO,
  _FILENAME_FRONTEND_DISTANCE_FLOAT32_FAC_BIN,
  _FILENAME_FRONTEND_FACILITIES_INT32_BIN,
  _FILENAME_FRONTEND_NEAREST_INT16_BIN,
  _FILENAME_FRONTEND_POP_FLOAT32_BIN,
} from "./consts.ts";
import { FacilitiesInfo, PopDimensions } from "./types.ts";
import { getFacilitiesData } from "./get_facilities_data.ts";
import { Meta } from "./types.ts";
import { getOutputSubFolderPath, getPopDimensions } from "./util_funcs.ts";

type FacilityInfoForFacilitiesInThisRaster = {
  number: number;
  lat: number;
  lon: number;
  x: number;
  y: number;
  facType: string;
};

export async function makeFacBinFilesForSubFolder(
  meta: Meta,
  subFolder: string
) {
  console.log("\n\n\nMaking fac bin files for " + subFolder + "\n\n\n");
  const subFolderPath = getOutputSubFolderPath(meta, subFolder);
  const popDimensions: PopDimensions = await getPopDimensions(subFolderPath);

  const _W = popDimensions.scaledPixels[1];
  const _H = popDimensions.scaledPixels[0];
  const _TL_X = popDimensions.scaledExtent[0];
  const _TL_Y = popDimensions.scaledExtent[3];
  const _BR_X = popDimensions.scaledExtent[1];
  const _BR_Y = popDimensions.scaledExtent[2];
  const FULL_GEO_DIST_LON = _BR_X - _TL_X;
  const FULL_GEO_DIST_LAT = _TL_Y - _BR_Y;

  function getXYFromLatLon(
    lat: number,
    lon: number
  ): { x: number | undefined; y: number | undefined } {
    // console.log(lat, lon, FULL_GEO_DIST_LON, FULL_GEO_DIST_LAT);
    const GEO_DIST_LON = lon - _TL_X;
    const PCT_DIST_X = GEO_DIST_LON / FULL_GEO_DIST_LON;
    const x = Math.round(_W * PCT_DIST_X);
    const GEO_DIST_LAT = _TL_Y - lat;
    const PCT_DIST_Y = GEO_DIST_LAT / FULL_GEO_DIST_LAT;
    const y = Math.round(_H * PCT_DIST_Y);
    if (x < 0 || x >= _W || y < 0 || y >= _H) {
      // console.log("Facility out of bounds");
      return { x: undefined, y: undefined };
    }
    return { x, y };
  }

  function getLatLonFromXY(x: number, y: number): { lat: number; lon: number } {
    const PCT_DIST_X = (x + 0.5) / _W;
    const GEO_DIST_LON = PCT_DIST_X * FULL_GEO_DIST_LON;
    const lon = GEO_DIST_LON + _TL_X;
    const PCT_DIST_Y = (y + 0.5) / _H;
    const GEO_DIST_LAT = PCT_DIST_Y * FULL_GEO_DIST_LAT;
    const lat = _TL_Y - GEO_DIST_LAT;
    if (lon > _BR_X || lon < _TL_X || lat > _TL_Y || lat < _BR_Y) {
      throw new Error("Out of bounds");
    }
    return { lat, lon };
  }

  const popData = new Float32Array(
    (
      await Deno.readFile(
        `${subFolderPath}/${_FILENAME_FRONTEND_POP_FLOAT32_BIN}`
      )
    ).buffer
  );

  ///////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////

  const facData = await getFacilitiesData(meta);
  const facilitiesInThisRaster: FacilityInfoForFacilitiesInThisRaster[] = [];
  const facLocationsBinData = new Int32Array(facData.length * 2);

  facData.forEach((f, i) => {
    if (!f.lat || !f.lon) {
      facLocationsBinData[i * 2] = -9999;
      facLocationsBinData[i * 2 + 1] = -9999;
      return;
    }
    if (isNaN(f.lat) || isNaN(f.lon)) {
      throw new Error("Bad lat or lon");
    }
    const { x, y } = getXYFromLatLon(f.lat, f.lon);
    if (!x || !y) {
      facLocationsBinData[i * 2] = -9999;
      facLocationsBinData[i * 2 + 1] = -9999;
      return;
    }

    /// Filter out facilities that are not in the population area
    const iPix = x + y * _W;
    const popVal = popData[iPix];
    if (popVal === -9999) {
      facLocationsBinData[i * 2] = -9999;
      facLocationsBinData[i * 2 + 1] = -9999;
      return;
    }

    facLocationsBinData[i * 2] = x;
    facLocationsBinData[i * 2 + 1] = y;

    f.x = x;
    f.y = y;
    f.isInThisRaster = true;

    facilitiesInThisRaster.push({
      number: i + 1,
      lat: f.lat,
      lon: f.lon,
      x,
      y,
      facType: f.facType,
    });
  });

  const specifiedFacTypes = meta.facilities.specifiedFacTypes?.include ?? [];
  const nNearestVals = 1 + specifiedFacTypes.length;

  const nearestBinData = new Int16Array(popData.length * nNearestVals);
  const distanceBinData = new Float32Array(popData.length * nNearestVals);

  for (let y = 0; y < _H; y++) {
    for (let x = 0; x < _W; x++) {
      const iPix = y * _W + x;
      const popDataValue = popData[iPix];
      if (popDataValue === -9999) {
        for (let i_f = 0; i_f < nNearestVals; i_f++) {
          const iForArrs = iPix * nNearestVals + i_f;
          nearestBinData[iForArrs] = -9999;
          distanceBinData[iForArrs] = -9999;
        }
        continue;
      }
      const { lat, lon } = getLatLonFromXY(x, y);
      const fs = getNearestFacilities(
        x,
        y,
        facilitiesInThisRaster,
        specifiedFacTypes
      );
      for (let i_f = 0; i_f < nNearestVals; i_f++) {
        const iForArrs = iPix * nNearestVals + i_f;
        const f = fs[i_f];
        if (!f) {
          nearestBinData[iForArrs] = -9999;
          distanceBinData[iForArrs] = -9999;
          continue;
        }
        nearestBinData[iForArrs] = f.number;
        const distMeters = getDistanceGeoMETERS(lon, lat, f.lon, f.lat);
        distanceBinData[iForArrs] = distMeters;
      }
    }
  }

  await Deno.writeFile(
    `${subFolderPath}/${_FILENAME_FRONTEND_FACILITIES_INT32_BIN}`,
    new Uint8Array(facLocationsBinData.buffer)
  );
  await Deno.writeFile(
    `${subFolderPath}/${_FILENAME_FRONTEND_NEAREST_INT16_BIN}`,
    new Uint8Array(nearestBinData.buffer)
  );
  await Deno.writeFile(
    `${subFolderPath}/${_FILENAME_FRONTEND_DISTANCE_FLOAT32_FAC_BIN}`,
    new Uint8Array(distanceBinData.buffer)
  );
  if (meta.facilities.facilityInfoVars) {
    await Deno.writeTextFile(
      `${subFolderPath}/${_FILENAME_FACILITY_INFO}`,
      JSON.stringify(facData)
    );
  }
  const facilitiesInfo: FacilitiesInfo = {
    nFacilitiesInDataset: facData.length,
    nFacilitiesInPopRaster: facilitiesInThisRaster.length,
    specifiedFacTypes,
    nNearestVals,
    facilityInfoHasBeenIncluded: !!meta.facilities.facilityInfoVars,
  };
  await Deno.writeTextFile(
    `${subFolderPath}/${_FILENAME_DATAPACKAGE_TEMP_FACILITIESINFO}`,
    JSON.stringify(facilitiesInfo)
  );
}

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

// function getNearestFacility(
//   popX: number,
//   popY: number,
//   facilities: FacilityInfo[]
// ): FacilityInfo | undefined {
//   let shortestDistance2 = 100000000;
//   let currentFacility = undefined;
//   for (let i = 0; i < facilities.length; i++) {
//     const f = facilities[i];
//     const distance2 = Math.pow(popX - f.x, 2) + Math.pow(popY - f.y, 2);
//     if (distance2 < shortestDistance2) {
//       shortestDistance2 = distance2;
//       currentFacility = f;
//     }
//   }
//   if (!currentFacility) {
//     return undefined;
//   }
//   return currentFacility;
// }

function getNearestFacilities(
  popX: number,
  popY: number,
  facilities: FacilityInfoForFacilitiesInThisRaster[],
  facTypes: string[]
): (FacilityInfoForFacilitiesInThisRaster | undefined)[] {
  const nearestFacilities: (
    | FacilityInfoForFacilitiesInThisRaster
    | undefined
  )[] = [];
  let shortestDistance2 = 100000000;
  let currentFacility = undefined;
  for (let i = 0; i < facilities.length; i++) {
    const f = facilities[i];
    const distance2 = Math.pow(popX - f.x, 2) + Math.pow(popY - f.y, 2);
    if (distance2 < shortestDistance2) {
      shortestDistance2 = distance2;
      currentFacility = f;
    }
  }
  if (!currentFacility) {
    nearestFacilities.push(undefined);
  }
  nearestFacilities.push(currentFacility);

  facTypes.forEach((facType) => {
    let shortestDistance2 = 100000000;
    let currentFacility = undefined;
    for (let i = 0; i < facilities.length; i++) {
      const f = facilities[i];
      if (f.facType !== facType) {
        continue;
      }
      const distance2 = Math.pow(popX - f.x, 2) + Math.pow(popY - f.y, 2);
      if (distance2 < shortestDistance2) {
        shortestDistance2 = distance2;
        currentFacility = f;
      }
    }
    if (!currentFacility) {
      nearestFacilities.push(undefined);
    }
    nearestFacilities.push(currentFacility);
  });

  return nearestFacilities;
}

function getDistanceGeoMETERS(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number {
  // Formula from https://www.movable-type.co.uk/scripts/latlong.html
  const r = 6_371_000.0;
  const t1 = getRadians(lat1);
  const t2 = getRadians(lat2);
  const dt = getRadians(lat2 - lat1);
  const dl = getRadians(lon2 - lon1);
  const a =
    Math.sin(dt / 2.0) * Math.sin(dt / 2.0) +
    Math.cos(t1) * Math.cos(t2) * Math.sin(dl / 2.0) * Math.sin(dl / 2.0);
  const c1 = Math.sqrt(a);
  const c2 = Math.sqrt(1.0 - a);
  const c = 2.0 * Math.atan2(c1, c2);

  const d = r * c;

  return d;
}

function getRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
