"use client";

import { useEffect, useRef } from "react";
import {
  CELL_REGION_MAP,
  TEMPLATE_HEIGHT,
  TEMPLATE_WIDTH,
} from "@/lib/catTemplate";
import { getFixedTemplateCellColor } from "@/lib/getFixedTemplateColor";
import type { FixedTemplateId } from "@/lib/fixedTemplateFamilies";

type Props = {
  templateId: FixedTemplateId;
  cellSize?: number;
};

export default function FixedTemplateRenderer({
  templateId,
  cellSize = 24,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = TEMPLATE_WIDTH * cellSize;
    canvas.height = TEMPLATE_HEIGHT * cellSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < TEMPLATE_HEIGHT; row++) {
      for (let col = 0; col < TEMPLATE_WIDTH; col++) {
        const region = CELL_REGION_MAP[row][col];
        const color = getFixedTemplateCellColor(
          templateId,
          row + 1,
          col + 1,
          region
        );

        ctx.fillStyle = color;
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }, [templateId, cellSize]);

  return (
    <canvas
      ref={canvasRef}
      className="border rounded bg-white"
      style={{
        width: TEMPLATE_WIDTH * cellSize,
        height: TEMPLATE_HEIGHT * cellSize,
        imageRendering: "pixelated",
      }}
    />
  );
}
