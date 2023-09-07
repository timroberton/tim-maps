export type Meta = {
  inputDirAbsolutePath: string;
  outputDirAbsolutePath: string;
  popTiffRelativePath: string;
  popTiffScale: ScaleDirectionAndFactor;
  popTiffCrop?: {
    WestBound: number;
    EastBound: number;
    SouthBound: number;
    NorthBound: number;
  };
  //
  facilities: FacilitiesInputInfo;
  //
  adm1?: MetaAdm;
  adm2?: MetaAdm;
  absolutePathToCopyOutputFilesTo?: string | string[];
};

export type MetaAdm = {
  shpRelativePath: string;
  featureColumnName: string;
  nFeatures: number;
  makeFeaturesAsIndividualDatasets: boolean;
};

export type ScaleDirectionAndFactor =
  | {
      direction: "increaseResolution" | "decreaseResolution";
      factor: number;
    }
  | { direction: "none" };

export type AdmSelection =
  | { level: "adm0" }
  | { level: "adm1"; featureNumber: number }
  | { level: "adm2"; featureNumber: number };

export type FacilitiesInputInfo =
  | {
      format: "csv";
      csvRelativePath: string;
      csvLatVar: string;
      csvLonVar: string;
      specifiedFacTypes?: {
        csvVar: string;
        include: string[];
      };
    }
  | {
      format: "json";
      jsonRelativePath: string;
      jsonLatProp: string;
      jsonLonProp: string;
      specifiedFacTypes?: {
        jsonProp: string;
        include: string[];
      };
    };

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

export type DataPackage = {
  popRasterDimensions: {
    pixelW: number;
    pixelH: number;
    nPixels: number;
    geoExtent: number[];
  };
  admInfo: AdmInfo;
  facilitiesInfo: FacilitiesInfo;
  files: string[];
};

export type PopDimensions = {
  scaledPixels: number[];
  scaledExtent: number[];
  nRows: number;
};

export type AdmInfo = {
  hasAdm1: boolean;
  minAdm1Number: number;
  maxAdm1Number: number;
  hasAdm2: boolean;
  minAdm2Number: number;
  maxAdm2Number: number;
};

export type FacilitiesInfo = {
  nFacilitiesInDataset: number;
  nFacilitiesInPopRaster: number;
  specifiedFacTypes: string[];
  nNearestVals: number;
};
