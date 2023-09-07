import { getSubFolderRScript } from "./get_subfolder_r_script.ts";
import { AdmSelection, Meta } from "./types.ts";
import { getOutputSubFolderPath } from "./util_funcs.ts";

export async function makePopBinFiles(
  meta: Meta,
  subFolder: string,
  admSelection: AdmSelection
) {
  console.log("\n\n\nMaking pop bin files for " + subFolder + "\n\n\n");
  const subFolderPath = getOutputSubFolderPath(meta, subFolder);
  const scriptForEachSubFolder = getSubFolderRScript(
    meta,
    subFolderPath,
    admSelection
  );
  const scriptFilePath = `${subFolderPath}/temp/script.R`;
  await Deno.writeTextFile(scriptFilePath, scriptForEachSubFolder);
  await new Deno.Command("Rscript", {
    args: [scriptFilePath],
    stdout: "inherit",
    stderr: "inherit",
  }).output();
}
