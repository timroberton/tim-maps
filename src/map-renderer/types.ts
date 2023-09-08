import { Canvas, chroma } from "./deps.ts";

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
  canvas: Canvas | undefined,
  chroma: chroma | undefined,
  data: TimMapData<FacValue, FacType, Adm1Value, Adm2Value>,
  config: RenderMapConfig<FacValue, FacType, Adm1Value, Adm2Value, ResutsObject>
): ResutsObject | undefined;
