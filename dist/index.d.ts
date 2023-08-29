export type PointStyle =
  | "circle"
  | "crossRot"
  | "rectRot"
  | "cross"
  | "rect"
  | "triangle";

export declare function renderMap<
  T extends number | string,
  U extends number | string,
  R
>(
  canvas: any,
  chroma: any,
  data: {
    pixPopUint8: Uint8Array;
    pixPopFloat32?: Float32Array;
    facLocations: Int32Array;
    pixNearestFacNumber?: Int32Array;
    pixNearestFacDistance?: Float32Array;
    facValues?: T[];
    facTypes?: U[];
  },
  helpers: {
    results?: {
      startingObject: R;
      popAccumulator: (
        currentObject: R,
        pop: number,
        nearestFacDistance: number | undefined,
        nearestFacValue: T | undefined,
        nearestFacType: U | undefined
      ) => void;
      facAccumulator: (
        currentObject: R,
        facValue: T | undefined,
        facType: U | undefined
      ) => void;
    };
    getPixelColor?: (
      nearestFacDistance: number | undefined,
      nearestFacValue: T | undefined,
      nearestFacType: U | undefined
    ) => string | undefined;
    getPointStyle?: (
      facValue: T | undefined,
      facType: U | undefined
    ) => PointStyle;
    getPointColor?: (facValue: T | undefined, facType: U | undefined) => string;
    getPointRadius?: (
      facValue: T | undefined,
      facType: U | undefined
    ) => number;
  },
  opts: {
    defaultPopColor: string;
    defaultFacPointColor: string;
    defaultFacPointStyle: PointStyle;
    defaultFacPointRadius: number;
    defaultFacPointStrokeWidth: number;
    mapPixelW: number;
    mapPixelH: number;
    mapPixelPad: number;
  }
): R | undefined;
