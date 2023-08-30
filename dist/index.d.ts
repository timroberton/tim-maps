export type PointStyle =
  | "circle"
  | "crossRot"
  | "rectRot"
  | "cross"
  | "rect"
  | "triangle";

export type RenderMapData<
  FacValue,
  FacType extends number | string,
  Adm1Value
> = {
  pixPopUint8: Uint8Array;
  pixPopFloat32?: Float32Array;
  // Facs
  facLocations?: Int32Array;
  facValues?: FacValue[];
  facTypes?: FacType[];
  pixNearestFacNumber?: Int32Array;
  pixNearestFacDistance?: Float32Array;
  // Adm1
  pixAdm1Index?: Uint8Array;
  adm1Values?: Adm1Value[];
};

export type FacVals<FacValue, FacType extends number | string> = {
  // Fac
  facValue?: FacValue;
  facType?: FacType;
};

export type PixelVals<FacValue, FacType extends number | string, Adm1Value> = {
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

export declare function renderMap<
  FacValue,
  FacType extends number | string,
  Adm1Value,
  ResutsObject
>(
  canvas: any,
  chroma: any,
  data: RenderMapData<FacValue, FacType, Adm1Value>,
  helpers: {
    results?: {
      startingObject: ResutsObject;
      popAccumulator: (
        currentObject: ResutsObject,
        vals: PixelVals<FacValue, FacType, Adm1Value>
      ) => void;
      facAccumulator: (
        currentObject: ResutsObject,
        vals: FacVals<FacValue, FacType>
      ) => void;
    };
    getPixelColor?: (vals: PixelVals<FacValue, FacType, Adm1Value>) => string;
    getPointColor?: (vals: FacVals<FacValue, FacType>) => string;
    getPointStyle?: (vals: FacVals<FacValue, FacType>) => PointStyle;
    getPointRadius?: (vals: FacVals<FacValue, FacType>) => number;
    getPointStrokeWidth?: (vals: FacVals<FacValue, FacType>) => number;
  },
  opts: {
    pixelColor?: string;
    pointColor?: string;
    pointStyle?: PointStyle;
    pointRadius?: number;
    pointStrokeWidth?: number;
    mapPixelW: number;
    mapPixelH: number;
    mapPixelPad: number;
  }
): ResutsObject | undefined;
