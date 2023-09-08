import { parse } from "./deps.ts";
import { Meta } from "./types.ts";

export async function getFacilitiesData(meta: Meta): Promise<
  {
    number: number;
    lat: number | undefined;
    lon: number | undefined;
    x: number;
    y: number;
    isInThisRaster: boolean;
    facType: string | "unknown";
  }[]
> {
  if (meta.facilities.format === "csv") {
    const facilitiesInfoCsv = meta.facilities;
    const facDataStr = await Deno.readTextFile(
      `${meta.inputDirAbsolutePath}/${meta.facilities.csvRelativePath}`
    );
    const facDataRaw: any[] = parse(facDataStr, { skipFirstRow: true });
    if (facDataRaw.length > 32767) {
      throw new Error(
        "Tim's program only allows for 32767 facilities in the dataset at most"
      );
    }
    return facDataRaw.map((fRaw, i) => {
      const baseObj = {
        number: i + 1,
        lat: fRaw[facilitiesInfoCsv.csvLatVar]
          ? Number(fRaw[facilitiesInfoCsv.csvLatVar])
          : undefined,
        lon: fRaw[facilitiesInfoCsv.csvLonVar]
          ? Number(fRaw[facilitiesInfoCsv.csvLonVar])
          : undefined,
        facType: facilitiesInfoCsv.specifiedFacTypes
          ? String(fRaw[facilitiesInfoCsv.specifiedFacTypes.csvVar]) ??
            "unknown"
          : "unknown",
        x: -1,
        y: -1,
        isInThisRaster: false,
      };
      facilitiesInfoCsv.facilityInfoVars?.forEach((keepVar) => {
        //@ts-ignore
        baseObj[keepVar] = fRaw[keepVar];
      });
      return baseObj;
    });
  } else {
    const facilitiesInfoJson = meta.facilities;
    const facDataStr = await Deno.readTextFile(
      `${meta.inputDirAbsolutePath}/${meta.facilities.jsonRelativePath}`
    );
    const facDataRaw: any[] = JSON.parse(facDataStr);
    return facDataRaw.map((fRaw, i) => {
      const baseObj = {
        number: i + 1,
        lat: fRaw[facilitiesInfoJson.jsonLatProp]
          ? Number(fRaw[facilitiesInfoJson.jsonLatProp])
          : undefined,
        lon: fRaw[facilitiesInfoJson.jsonLonProp]
          ? Number(fRaw[facilitiesInfoJson.jsonLonProp])
          : undefined,
        facType: facilitiesInfoJson.specifiedFacTypes
          ? String(fRaw[facilitiesInfoJson.specifiedFacTypes.jsonProp]) ??
            "unknown"
          : "unknown",
        x: -1,
        y: -1,
        isInThisRaster: false,
      };
      facilitiesInfoJson.facilityInfoVars?.forEach((keepProp) => {
        //@ts-ignore
        baseObj[keepProp] = fRaw[keepProp];
      });
      return baseObj;
    });
  }
}
