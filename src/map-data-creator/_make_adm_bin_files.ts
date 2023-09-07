import {
  _FILENAME_DATAPACKAGE_TEMP_ADM,
  _FILENAME_FRONTEND_ADM1_BIN,
  _FILENAME_FRONTEND_ADM1_BIN_UNCHECKED,
  _FILENAME_FRONTEND_ADM2_BIN,
  _FILENAME_FRONTEND_ADM2_BIN_UNCHECKED,
  _FILENAME_FRONTEND_POP_FLOAT32_BIN,
} from "./consts.ts";
import { AdmInfo, PopDimensions } from "./types.ts";
import { AdmSelection, Meta } from "./types.ts";
import { getOutputSubFolderPath, getPopDimensions } from "./util_funcs.ts";

export async function makeAdmBinFilesForSubFolder(
  meta: Meta,
  subFolder: string,
  admSelection: AdmSelection
) {
  console.log("\n\n\nMaking adm bin files for " + subFolder + "\n\n\n");
  const subFolderPath = getOutputSubFolderPath(meta, subFolder);
  const popDimensions: PopDimensions = await getPopDimensions(subFolderPath);

  const _W = popDimensions.scaledPixels[1];
  const _H = popDimensions.scaledPixels[0];
  let minAdm1Number = Number.POSITIVE_INFINITY;
  let maxAdm1Number = Number.NEGATIVE_INFINITY;
  let minAdm2Number = Number.POSITIVE_INFINITY;
  let maxAdm2Number = Number.NEGATIVE_INFINITY;

  const popData = new Float32Array(
    (
      await Deno.readFile(
        `${subFolderPath}/${_FILENAME_FRONTEND_POP_FLOAT32_BIN}`
      )
    ).buffer
  );

  if (meta.adm1) {
    const adm1DataUnchecked = await Deno.readFile(
      `${subFolderPath}/${_FILENAME_FRONTEND_ADM1_BIN_UNCHECKED}`
    );
    const goodAdm1BinData = new Uint8Array(popData.length);

    for (let y = 0; y < _H; y++) {
      for (let x = 0; x < _W; x++) {
        const iPix = y * _W + x;
        const popDataValue = popData[iPix];
        if (popDataValue === -9999) {
          goodAdm1BinData[iPix] = 0;
        } else {
          let adm1 = adm1DataUnchecked[iPix];
          if (adm1 === 0) {
            adm1 = getNearestAdm(adm1DataUnchecked, x, y, _W, _H);
          }
          if (
            admSelection.level === "adm1" &&
            admSelection.featureNumber !== adm1
          ) {
            console.log(adm1, admSelection);
            throw new Error("Mismatched adm1 number");
          }
          goodAdm1BinData[iPix] = adm1;
          minAdm1Number = Math.min(minAdm1Number, adm1);
          maxAdm1Number = Math.max(maxAdm1Number, adm1);
        }
      }
    }

    await Deno.writeFile(
      `${subFolderPath}/${_FILENAME_FRONTEND_ADM1_BIN}`,
      new Uint8Array(goodAdm1BinData.buffer)
    );
  }

  if (meta.adm2) {
    const adm2DataUnchecked = await Deno.readFile(
      `${subFolderPath}/${_FILENAME_FRONTEND_ADM2_BIN_UNCHECKED}`
    );
    const goodAdm2BinData = new Uint8Array(popData.length);

    for (let y = 0; y < _H; y++) {
      for (let x = 0; x < _W; x++) {
        const iPix = y * _W + x;
        const popDataValue = popData[iPix];
        if (popDataValue === -9999) {
          goodAdm2BinData[iPix] = 0;
        } else {
          let adm2 = adm2DataUnchecked[iPix];
          if (adm2 === 0) {
            adm2 = getNearestAdm(adm2DataUnchecked, x, y, _W, _H);
          }
          if (
            admSelection.level === "adm2" &&
            admSelection.featureNumber !== adm2
          ) {
            console.log(adm2, admSelection);
            throw new Error("Mismatched adm2 number");
          }
          goodAdm2BinData[iPix] = adm2;
          minAdm2Number = Math.min(minAdm2Number, adm2);
          maxAdm2Number = Math.max(maxAdm2Number, adm2);
        }
      }
    }

    await Deno.writeFile(
      `${subFolderPath}/${_FILENAME_FRONTEND_ADM2_BIN}`,
      new Uint8Array(goodAdm2BinData.buffer)
    );
  }

  const admInfo: AdmInfo = {
    hasAdm1: !!meta.adm1,
    minAdm1Number,
    maxAdm1Number,
    hasAdm2: !!meta.adm2,
    minAdm2Number,
    maxAdm2Number,
  };
  await Deno.writeTextFile(
    `${subFolderPath}/${_FILENAME_DATAPACKAGE_TEMP_ADM}`,
    JSON.stringify(admInfo)
  );
}

function getNearestAdm(
  admData: Uint8Array,
  x: number,
  y: number,
  _W: number,
  _H: number
): number {
  let adm = admData[y * _W + x];
  for (let i = 1; i < 200; i++) {
    if (x + i < _W) {
      adm = admData[y * _W + (x + i)];
      if (adm !== 0) {
        break;
      }
    }
    if (x - i >= 0) {
      adm = admData[y * _W + (x - i)];
      if (adm !== 0) {
        break;
      }
    }
    if (y + i < _H) {
      adm = admData[(y + i) * _W + x];
      if (adm !== 0) {
        break;
      }
    }
    if (y - i >= 0) {
      adm = admData[(y - i) * _W + x];
      if (adm !== 0) {
        break;
      }
    }
  }

  if (adm === 0 || typeof adm === "undefined") {
    // console.log("ADM1", adm, x, y, _W, _H);
    throw new Error("Problem getting nearest adm1");
  }

  return adm;
}
