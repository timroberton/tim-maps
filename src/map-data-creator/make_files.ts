import { copy } from "https://deno.land/std@0.201.0/fs/copy.ts";
import { makeAdmBinFilesForSubFolder } from "./_make_adm_bin_files.ts";
import { makeDataPackage } from "./_make_data_package.ts";
import { makeFacBinFilesForSubFolder } from "./_make_fac_bin_files.ts";
import { makePopBinFiles } from "./_make_pop_bin_files.ts";
import { emptyDir } from "./deps.ts";
import { getGDalScript } from "./get_gdal_script.ts";
import { getMainRScriptForAdm0ScaledTif } from "./get_main_r_script_for_adm0_scaled_tif.ts";
import { AdmSelection, Meta } from "./types.ts";
import { getOutputGlobalsPath, getOutputSubFolderPath } from "./util_funcs.ts";

export async function makeFiles(meta: Meta) {
  if (meta.adm1) {
    if (meta.adm1.nFeatures > 254 || meta.adm1.nFeatures > 254) {
      throw new Error("Tim's program only allows for 254 features at most");
    }
  }
  if (meta.adm2) {
    if (meta.adm2.nFeatures > 254 || meta.adm2.nFeatures > 254) {
      throw new Error("Tim's program only allows for 254 features at most");
    }
  }

  // Make main directories
  console.log(meta.outputDirAbsolutePath);
  await emptyDir(meta.outputDirAbsolutePath);
  const globalsPath = getOutputGlobalsPath(meta);
  await emptyDir(globalsPath);

  // Uncompress tif
  const gdalScript = getGDalScript(meta);
  const gdalScriptFilePath = `${globalsPath}/gdal_script.sh`;
  await Deno.writeTextFile(gdalScriptFilePath, gdalScript);
  await new Deno.Command("sh", {
    args: [gdalScriptFilePath],
    stdout: "inherit",
    stderr: "inherit",
  }).output();
  await Deno.remove(gdalScriptFilePath);

  // Make adm0 scaled raster
  const mainRScriptToMakeRasters = getMainRScriptForAdm0ScaledTif(meta);
  const mainRScriptFilePath = `${globalsPath}/make_adm0_scaled_tif_script.R`;
  await Deno.writeTextFile(mainRScriptFilePath, mainRScriptToMakeRasters);
  await new Deno.Command("Rscript", {
    args: [mainRScriptFilePath],
    stdout: "inherit",
    stderr: "inherit",
  }).output();
  await Deno.remove(mainRScriptFilePath);

  // Make all subfolder files
  await runSubFolder(meta, "adm0", { level: "adm0" });
  if (meta.adm1 && meta.adm1.makeFeaturesAsIndividualDatasets) {
    for (let i = 0; i < meta.adm1.nFeatures; i++) {
      await runSubFolder(meta, `adm1_feature${i + 1}`, {
        level: "adm1",
        featureNumber: i + 1,
      });
    }
  }
  if (meta.adm2 && meta.adm2.makeFeaturesAsIndividualDatasets) {
    for (let i = 0; i < meta.adm2.nFeatures; i++) {
      await runSubFolder(meta, `adm2_feature${i + 1}`, {
        level: "adm2",
        featureNumber: i + 1,
      });
    }
  }

  // Copy files if necessary
  if (meta.absolutePathToCopyOutputFilesTo) {
    if (typeof meta.absolutePathToCopyOutputFilesTo === "string") {
      await Deno.remove(meta.absolutePathToCopyOutputFilesTo, {
        recursive: true,
      });
      await copy(
        meta.outputDirAbsolutePath,
        meta.absolutePathToCopyOutputFilesTo
      );
    } else {
      for (let i = 0; i < meta.absolutePathToCopyOutputFilesTo.length; i++) {
        await Deno.remove(meta.absolutePathToCopyOutputFilesTo[i], {
          recursive: true,
        });
        await copy(
          meta.outputDirAbsolutePath,
          meta.absolutePathToCopyOutputFilesTo[i]
        );
      }
    }
  }
}

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

async function runSubFolder(
  meta: Meta,
  subFolder: string,
  admSelection: AdmSelection
) {
  const subFolderPath = getOutputSubFolderPath(meta, subFolder);
  await emptyDir(subFolderPath);
  await emptyDir(`${subFolderPath}/temp`);
  await makePopBinFiles(meta, subFolder, admSelection);
  await makeAdmBinFilesForSubFolder(meta, subFolder, admSelection);
  await makeFacBinFilesForSubFolder(meta, subFolder);
  await makeDataPackage(meta, subFolder);
  await Deno.remove(`${subFolderPath}/temp`, {
    recursive: true,
  });
}
