export type Thing = { a: 1 };

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
    popUint8: Uint8Array;
    facLocations: Int32Array;
    facValues: T[];
    facTypes?: U[];
  },
  helpers: {
    getPointStyleFromFacValue?: (v: T, t: U | undefined) => PointStyle;
    getPointColorFromFacValue?: (v: T, t: U | undefined) => string;
  },
  opts: {
    popColor: string;
    mapPixelW: number;
    mapPixelH: number;
    mapPixelPad: number;
  }
): void;
