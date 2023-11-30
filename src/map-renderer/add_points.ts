import { CanvasRenderingContext2D, ChromaStatic } from "./deps.ts";
import { PointStyle } from "./types.ts";

const _COSINE_45 = 0.7071067811865476;
const _SINE_60 = 0.8660254037844386;
const _COSINE_60 = 0.5;

export function getPointStyle(
  pointStyles: PointStyle[],
  pointIndex: number
): PointStyle {
  if (pointIndex < pointStyles.length - 1) {
    return pointStyles[pointIndex];
  }
  const goodPointIndex = pointIndex % pointStyles.length;
  return pointStyles[goodPointIndex];
}

export function addPoint(
  ctx: CanvasRenderingContext2D,
  pointStyle: PointStyle,
  x: number,
  y: number,
  radius: number,
  color: string,
  strokeWidth: number,
  chroma: ChromaStatic
) {
  switch (pointStyle) {
    case "circle":
      drawCircle(
        ctx,
        x,
        y,
        radius,
        chroma(color).alpha(0.3).css(),
        color,
        strokeWidth
      );
      return;
    case "cross":
      drawCross(ctx, x, y, radius, color, strokeWidth);
      return;
    case "rect":
      drawRect(
        ctx,
        x,
        y,
        radius,
        chroma(color).alpha(0.3).css(),
        color,
        strokeWidth
      );
      return;
    case "crossRot":
      drawCrossRot(ctx, x, y, radius, color, strokeWidth);
      return;
    case "rectRot":
      drawRectRot(
        ctx,
        x,
        y,
        radius,
        chroma(color).alpha(0.3).css(),
        color,
        strokeWidth
      );
      return;
    case "triangle":
      drawTriangle(
        ctx,
        x,
        y,
        radius,
        chroma(color).alpha(0.3).css(),
        color,
        strokeWidth
      );
      return;
  }
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fill: string | undefined,
  stroke: string,
  strokeWidth: number
) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function drawCrossRot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  stroke: string,
  strokeWidth: number
) {
  const sideGivenRadius = radius * _COSINE_45;
  ctx.beginPath();
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = stroke;
  ctx.moveTo(x - sideGivenRadius, y - sideGivenRadius);
  ctx.lineTo(x + sideGivenRadius, y + sideGivenRadius);
  ctx.moveTo(x + sideGivenRadius, y - sideGivenRadius);
  ctx.lineTo(x - sideGivenRadius, y + sideGivenRadius);
  ctx.stroke();
}

function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fill: string | undefined,
  stroke: string,
  strokeWidth: number
) {
  const sideGivenRadius = radius * _COSINE_45;
  ctx.beginPath();
  ctx.rect(
    x - sideGivenRadius,
    y - sideGivenRadius,
    sideGivenRadius * 2,
    sideGivenRadius * 2
  );
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function drawCross(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  stroke: string,
  strokeWidth: number
) {
  ctx.beginPath();
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = stroke;
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x, y + radius);
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x - radius, y);
  ctx.stroke();
}

function drawRectRot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fill: string | undefined,
  stroke: string,
  strokeWidth: number
) {
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x + radius, y);
  ctx.lineTo(x, y + radius);
  ctx.lineTo(x - radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fill: string | undefined,
  stroke: string,
  strokeWidth: number
) {
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x + radius * _SINE_60, y + radius * _COSINE_60);
  ctx.lineTo(x - radius * _SINE_60, y + radius * _COSINE_60);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}
