"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { getRegionColor } from "@/lib/coatRules";
import {
  CELL_REGION_MAP,
  TEMPLATE_HEIGHT,
  TEMPLATE_WIDTH,
} from "@/lib/catTemplate";
import type { CoatConfig } from "@/lib/colorRoles";

export type PixelCatRendererHandle = {
  downloadPng: () => void;
};

type PixelCatRendererProps = {
  config: CoatConfig;
  cellSize?: number;
  exportSize?: number;
};

function paintPixelCat(
  canvas: HTMLCanvasElement,
  config: CoatConfig,
  cellSize: number,
  paddingX = 0,
  paddingY = 0,
) {
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, canvas.width, canvas.height);

  CELL_REGION_MAP.forEach((row, rowIndex) => {
    row.forEach((region, colIndex) => {
      const color = getRegionColor(region, config);

      if (color === "transparent") {
        return;
      }

      context.fillStyle = color;
      context.fillRect(
        paddingX + colIndex * cellSize,
        paddingY + rowIndex * cellSize,
        cellSize,
        cellSize,
      );
    });
  });
}

function exportPixelCat(config: CoatConfig, exportSize: number) {
  const canvas = document.createElement("canvas");
  const cellSize = Math.floor(
    exportSize / Math.max(TEMPLATE_WIDTH, TEMPLATE_HEIGHT),
  );
  const renderWidth = TEMPLATE_WIDTH * cellSize;
  const renderHeight = TEMPLATE_HEIGHT * cellSize;

  canvas.width = exportSize;
  canvas.height = exportSize;

  paintPixelCat(
    canvas,
    config,
    cellSize,
    Math.floor((exportSize - renderWidth) / 2),
    Math.floor((exportSize - renderHeight) / 2),
  );

  return canvas.toDataURL("image/png");
}

export const PixelCatRenderer = forwardRef<
  PixelCatRendererHandle,
  PixelCatRendererProps
>(function PixelCatRenderer({ config, cellSize = 24, exportSize = 1024 }, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    paintPixelCat(canvas, config, cellSize);
  }, [cellSize, config]);

  useImperativeHandle(
    ref,
    () => ({
      downloadPng() {
        const link = document.createElement("a");
        link.href = exportPixelCat(config, exportSize);
        link.download = "pixel-cat-avatar.png";
        link.click();
      },
    }),
    [config, exportSize],
  );

  return (
    <canvas
      ref={canvasRef}
      width={TEMPLATE_WIDTH * cellSize}
      height={TEMPLATE_HEIGHT * cellSize}
      className="h-auto w-full max-w-[504px] [image-rendering:pixelated]"
      aria-label="Rendered faceless pixel cat"
    />
  );
});
