import {
  FLEX_TEMPLATE_HEIGHT,
  FLEX_TEMPLATE_WIDTH,
} from "./flexibleCatTemplate";

export type PixelCatCanvasMetrics = {
  cellSize: number;
  paddingX: number;
  paddingY: number;
  renderHeight: number;
  renderWidth: number;
  size: number;
};

export function getPixelCatCanvasMetrics(size: number): PixelCatCanvasMetrics {
  const cellSize = Math.floor(
    size / Math.max(FLEX_TEMPLATE_WIDTH, FLEX_TEMPLATE_HEIGHT),
  );
  const renderWidth = FLEX_TEMPLATE_WIDTH * cellSize;
  const renderHeight = FLEX_TEMPLATE_HEIGHT * cellSize;

  return {
    cellSize,
    paddingX: Math.floor((size - renderWidth) / 2),
    paddingY: size - renderHeight,
    renderHeight,
    renderWidth,
    size,
  };
}

export function getPixelCatCellRect(row: number, col: number, size: number) {
  const metrics = getPixelCatCanvasMetrics(size);

  return {
    height: metrics.cellSize,
    width: metrics.cellSize,
    x: metrics.paddingX + (col - 1) * metrics.cellSize,
    y: metrics.paddingY + (row - 1) * metrics.cellSize,
  };
}
