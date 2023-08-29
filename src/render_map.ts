import { PointStyle, addPoint } from "./add_points.ts";
import { Canvas, chroma } from "./deps.ts";

export function renderMap<T extends number | string>(
  canvas: Canvas,
  chroma: chroma,
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
) {
  console.log("Rendering map x", canvas.width, canvas.height);

  const ctx = canvas.getContext("2d");

  const imageData = ctx.createImageData(opts.mapPixelW, opts.mapPixelH);

  if (data.popUint8.length !== imageData.width * imageData.height) {
    throw new Error("PopUint8 not same length as canvas");
  }
  if (data.facLocations.length !== data.facValues.length * 2) {
    throw new Error("facLocations not twice the length of facValues");
  }

  const popColorRgb = [240, 34, 156, 140];

  for (let iPix = 0; iPix < data.popUint8.length; iPix++) {
    if (data.popUint8[iPix] === 255) {
      continue;
    }
    const iImgData = iPix * 4;
    imageData.data[iImgData + 0] = popColorRgb[0];
    imageData.data[iImgData + 1] = popColorRgb[1];
    imageData.data[iImgData + 2] = popColorRgb[2];
    imageData.data[iImgData + 3] = data.popUint8[iPix];
  }

  ctx.putImageData(imageData, opts.mapPixelPad, opts.mapPixelPad);

  const nFacs = data.facLocations.length / 2;
  for (let iFac = 0; iFac < nFacs; iFac++) {
    const facX = data.facLocations[iFac * 2];
    const facY = data.facLocations[iFac * 2 + 1];
    const facV = data.facValues[iFac];
    addPoint(
      ctx,
      helpers.getPointStyleFromFacValue(facV),
      facX + opts.mapPixelPad,
      facY + opts.mapPixelPad,
      10,
      "blue",
      3,
      chroma
    );

    // if (feature.symbol === "circle") {
    //   drawCircle(ctx, facX, facY, 16, fillColor, strokeColor, 5);
    // } else if (feature.symbol === "cross") {
    //   drawCross(ctx, facX, facY, 16, strokeColor, 5);
    // }
  }
  // addPoint(ctx, "circle", 40, 40, 10, "red", 3, chroma);
  // addPoint(ctx, "circle", 140, 40, 10, "green", 3, chroma);
  // addPoint(ctx, "circle", 40, 140, 10, "blue", 3, chroma);
}
