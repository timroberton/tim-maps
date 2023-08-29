export type PointStyle =
  | "circle"
  | "crossRot"
  | "rectRot"
  | "cross"
  | "rect"
  | "triangle";

export declare function renderMap<
  T extends number | string,
  U extends number | string
>(
  canvas: any,
  chroma: any,
  data: {
    pixPopUint8: Uint8Array;
    facLocations: Int32Array;
    pixNearestFacNumber?: Int32Array;
    pixNearestFacDistance?: Float32Array;
    facValues?: T[];
    facTypes?: U[];
  },
  helpers: {
    getPixelColor?: (
      pixNearestFacDistance: number | undefined,
      facValue: T | undefined,
      facType: U | undefined
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
    mapPixelW: number;
    mapPixelH: number;
    mapPixelPad: number;
  }
): void;
