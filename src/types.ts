import { Canvas, chroma } from "./deps.ts";

export type PointStyle =
  | "circle"
  | "crossRot"
  | "rectRot"
  | "cross"
  | "rect"
  | "triangle";

export type TimMapData<FacValue, FacType, Adm1Value> = {
  pixPopUint8: Uint8Array;
  pixPopFloat32?: Float32Array;
  // Facs
  facLocations?: Int32Array;
  facValues?: FacValue[];
  facTypes?: FacType[];
  pixNearestFacNumber?: Int32Array;
  pixNearestFacDistance?: Float32Array;
  // Adm1
  pixAdm1Number?: Uint8Array;
  adm1Values?: Adm1Value[];
};

export type TimMapResults<FacValue, FacType, Adm1Value, ResutsObject> = {
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

export type RenderMapConfig<FacValue, FacType, Adm1Value, ResutsObject> = {
  crop?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  mapPixelW: number;
  mapPixelH: number;
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
  results?: TimMapResults<FacValue, FacType, Adm1Value, ResutsObject>;
};

export type GetResultsConfig = {
  validate?: boolean;
};

export type PixelVals<FacValue, FacType, Adm1Value> = {
  popFloat32?: number;
  // Fac
  nearestFacIndex?: number;
  nearestFacDistance?: number;
  nearestFacValue?: FacValue;
  nearestFacType?: FacType;
  // Adm1
  adm1Index?: number;
  adm1Value?: Adm1Value;
};

export type FacVals<FacValue, FacType> = {
  // Fac
  facValue?: FacValue;
  facType?: FacType;
};

export declare function renderMap<FacValue, FacType, Adm1Value, ResutsObject>(
  canvas: Canvas,
  chroma: chroma,
  data: TimMapData<FacValue, FacType, Adm1Value>,
  config: RenderMapConfig<FacValue, FacType, Adm1Value, ResutsObject>
): ResutsObject | undefined;

export declare function getResults<FacValue, FacType, Adm1Value, ResutsObject>(
  data: TimMapData<FacValue, FacType, Adm1Value>,
  results: TimMapResults<FacValue, FacType, Adm1Value, ResutsObject>,
  config?: GetResultsConfig
): ResutsObject | undefined;
