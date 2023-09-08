 

export type PointStyle =
  | "circle"
  | "crossRot"
  | "rectRot"
  | "cross"
  | "rect"
  | "triangle";

export type TimMapData<FacValue, FacType, Adm1Value, Adm2Value> = {
  pixPopUint8: Uint8Array;
  pixPopFloat32?: Float32Array;
  pixW: number;
  pixH: number;
  // Facs
  facs?: {
    facLocations: Int32Array;
    facValues?: FacValue[];
    facTypes?: FacType[];
    // Linked
    facLinks?: {
      pixNearestFacNumber: Int16Array;
      pixNearestFacDistance: Float32Array;
      nNearestVals: number;
    };
  };
  // Adm1
  adm1?: {
    pixAdm1Number: Uint8Array;
    adm1Values?: Adm1Value[];
  };
  // Adm1
  adm2?: {
    pixAdm2Number: Uint8Array;
    adm2Values?: Adm2Value[];
  };
};

export type TimMapResults<
  FacValue,
  FacType,
  Adm1Value,
  Adm2Value,
  ResutsObject
> = {
  startingObject: ResutsObject;
  popAccumulator?: (
    currentObject: ResutsObject,
    pixelVals: PixelVals<FacValue, FacType, Adm1Value>
  ) => void;
  facAccumulator?: (
    currentObject: ResutsObject,
    facVals: FacVals<FacValue, FacType>,
    pixelVals: PixelVals<FacValue, FacType, Adm1Value>
  ) => void;
};

export type RenderMapConfig<
  FacValue,
  FacType,
  Adm1Value,
  Adm2Value,
  ResutsObject
> = {
  crop?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  mapPixelPad?: number;
  validate?: boolean;
  filterPixels?: (
    pixelVals: PixelVals<FacValue, FacType, Adm1Value>
  ) => boolean;
  filterFacs?: (
    facVals: FacVals<FacValue, FacType>,
    pixelVals: PixelVals<FacValue, FacType, Adm1Value>
  ) => boolean;
  //
  pixelColor?: string;
  pointColor?: string;
  pointStyle?: PointStyle;
  pointRadius?: number;
  pointStrokeWidth?: number;
  getPixelColor?: (
    pixelVals: PixelVals<FacValue, FacType, Adm1Value>
  ) => string;
  getPointColor?: (
    facVals: FacVals<FacValue, FacType>,
    pixelVals: PixelVals<FacValue, FacType, Adm1Value>
  ) => string;
  getPointStyle?: (
    facVals: FacVals<FacValue, FacType>,
    pixelVals: PixelVals<FacValue, FacType, Adm1Value>
  ) => PointStyle;
  getPointRadius?: (
    facVals: FacVals<FacValue, FacType>,
    pixelVals: PixelVals<FacValue, FacType, Adm1Value>
  ) => number;
  getPointStrokeWidth?: (
    facVals: FacVals<FacValue, FacType>,
    pixelVals: PixelVals<FacValue, FacType, Adm1Value>
  ) => number;
  results?: TimMapResults<
    FacValue,
    FacType,
    Adm1Value,
    Adm2Value,
    ResutsObject
  >;
};

export type GetResultsConfig = {
  validate?: boolean;
};

export type PixelVals<FacValue, FacType, Adm1Value> = {
  popFloat32?: number;
  // Linked facs
  nearestFacs: (
    | {
        facIndex: number;
        facDistance: number;
        facValue?: FacValue;
        facType?: FacType;
      }
    | "nofac"
  )[];
  // Adm1
  adm1Index?: number;
  adm1Value?: Adm1Value;
};

export type FacVals<FacValue, FacType> = {
  // Fac
  facValue?: FacValue;
  facType?: FacType;
};

export declare function renderMap<
  FacValue,
  FacType,
  Adm1Value,
  Adm2Value,
  ResutsObject
>(
  canvas: any,
  chroma: any,
  data: TimMapData<FacValue, FacType, Adm1Value, Adm2Value>,
  config: RenderMapConfig<FacValue, FacType, Adm1Value, Adm2Value, ResutsObject>
): ResutsObject | undefined;



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
      facilityInfoVars?: string[];
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
      facilityInfoVars?: string[];
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
  facilityInfoHasBeenIncluded: boolean;
};



 
 

export type MapFiles = {
  dataPackage: DataPackage;
  pop_uint8: Uint8Array;
  pop_float32?: Float32Array;
  facs?: {
    facilities_int32: Int32Array;
    facLinks?: {
      nearest_int16: Int16Array;
      distance_float32: Float32Array;
    };
    facilityInfo?: any[];
  };
  adm1_uint8?: Uint8Array;
  adm2_uint8?: Uint8Array;
};

export declare function fetchMapFiles(
  url: string,
  updateProgress?: (pct: number) => void
): Promise<MapFiles>;

export declare function getMapDataFromFiles<
  FacValue,
  FacType,
  Adm1Value,
  Adm2Value
>(
  mapFiles: MapFiles,
  valueFiles: {
    facValuesOverride?: FacValue[];
    facTypes?: FacType[];
    adm1Values?: Adm1Value[];
    adm2Values?: Adm2Value[];
  }
): TimMapData<FacValue, FacType, Adm1Value, Adm2Value>;
