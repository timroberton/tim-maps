export type Thing = { a: 1 };

export type PointStyle =
  | "circle"
  | "crossRot"
  | "rectRot"
  | "cross"
  | "rect"
  | "triangle";

export function renderMap<T extends number | string>(
  canvas: any,
  chroma: any,
  data: {
    popUint8: Uint8Array;
    facLocations: Int32Array;
    facValues: T[];
  },
  helpers: {
    getPointStyleFromFacValue: (v: T) => PointStyle;
  },
  opts: {
    mapPixelW: number;
    mapPixelH: number;
    mapPixelPad: number;
  }
): void;
