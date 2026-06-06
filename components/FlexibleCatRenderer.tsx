"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type MouseEvent,
} from "react";

import {
  FLEX_TEMPLATE_HEIGHT,
  FLEX_TEMPLATE_WIDTH,
  FLEXIBLE_FUR_REGION_MAP,
} from "@/lib/flexibleCatTemplate";
import {
  getAccessoryPreset,
  type AccessoryPreset,
} from "@/lib/accessoryTemplate";
import {
  getFaceFeaturePreset,
  type FaceFeaturePreset,
} from "@/lib/faceFeatureTemplate";
import {
  FUR_ROLE_HEX,
  type FlexibleRenderConfig,
  type RenderableFlexibleFurRegion,
} from "@/lib/flexibleCatTypes";
import { getPixelCatCanvasMetrics } from "@/lib/pixelCanvasMetrics";

export type FlexibleCatRendererHandle = {
  downloadPng: () => Promise<"downloaded" | "shared">;
};

type FlexibleCatRendererProps = {
  config: FlexibleRenderConfig;
  cellSize?: number;
  exportSize?: number;
  selectedRegion?: RenderableFlexibleFurRegion | null;
  onRegionSelect?: (region: RenderableFlexibleFurRegion) => void;
};

type ExtractedOverlayCell = {
  row: number;
  col: number;
  color: string;
};

type ProcessedOverlay = {
  cells: ExtractedOverlayCell[];
};

const faceOverlayCache = new Map<string, Promise<ProcessedOverlay>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load face overlay ${src}`));
    image.src = src;
  });
}

function shouldKeepExpressionPixel(
  red: number,
  green: number,
  blue: number,
  alpha: number,
) {
  if (alpha < 16) {
    return false;
  }

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const saturation = max - min;

  // Keep black/dark expression blocks.
  if (max < 95) {
    return true;
  }

  // Keep medium grey expression blocks, but drop pale grid lines.
  if (max < 175 && saturation < 38) {
    return true;
  }

  // Keep saturated eye colors such as blue, yellow, green, and pink.
  return saturation > 42 && max < 248;
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue]
    .map((value) =>
      Math.max(0, Math.min(255, Math.round(value)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function normalizeExpressionColor(
  src: string,
  red: number,
  green: number,
  blue: number,
) {
  const max = Math.max(red, green, blue);

  if (max < 120) {
    return "#161112";
  }

  if (src.includes("grey_soft")) {
    return "#8F8F95";
  }

  if (src.includes("yellow_classic")) {
    return "#F2E45F";
  }

  if (src.includes("green_lively")) {
    return "#A6E879";
  }

  if (src.includes("blue_classic")) {
    return "#55C9E8";
  }

  if (src.includes("odd_eyes")) {
    return blue > green ? "#55C9E8" : "#F2E45F";
  }

  return rgbToHex(red, green, blue);
}

function median(values: number[]) {
  if (!values.length) {
    return 1;
  }

  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function detectGridAxis(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  axis: "x" | "y",
) {
  const limit = axis === "x" ? width : height;
  const crossLimit = axis === "x" ? height : width;
  const lineCandidates: number[] = [];

  for (let primary = 0; primary < limit; primary++) {
    let score = 0;

    for (let secondary = 0; secondary < crossLimit; secondary++) {
      const x = axis === "x" ? primary : secondary;
      const y = axis === "x" ? secondary : primary;
      const index = (y * width + x) * 4;
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const max = Math.max(red, green, blue);
      const min = Math.min(red, green, blue);

      if (max - min < 16 && max > 120 && max < 246) {
        score += 1;
      }
    }

    if (score > crossLimit * 0.42) {
      lineCandidates.push(primary);
    }
  }

  const centers: number[] = [];
  let runStart: number | null = null;
  let previous: number | null = null;

  lineCandidates.forEach((candidate) => {
    if (runStart === null || previous === null) {
      runStart = candidate;
      previous = candidate;
      return;
    }

    if (candidate <= previous + 1) {
      previous = candidate;
      return;
    }

    centers.push((runStart + previous) / 2);
    runStart = candidate;
    previous = candidate;
  });

  if (runStart !== null && previous !== null) {
    centers.push((runStart + previous) / 2);
  }

  const gaps = centers
    .slice(1)
    .map((center, index) => center - centers[index])
    .filter((gap) => gap > 8 && gap < 90);

  return {
    firstLine: centers[0] ?? 0,
    pitch: median(gaps),
  };
}

async function getProcessedFaceOverlay(src: string): Promise<ProcessedOverlay> {
  const cached = faceOverlayCache.get(src);

  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const image = await loadImage(src);
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const sourceCanvas = document.createElement("canvas");
    const sourceContext = sourceCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!sourceContext) {
      throw new Error("Could not prepare face overlay canvas.");
    }

    sourceCanvas.width = sourceWidth;
    sourceCanvas.height = sourceHeight;
    sourceContext.imageSmoothingEnabled = false;
    sourceContext.drawImage(image, 0, 0);

    const imageData = sourceContext.getImageData(0, 0, sourceWidth, sourceHeight);
    const { data } = imageData;
    const gridX = detectGridAxis(data, sourceWidth, sourceHeight, "x");
    const gridY = detectGridAxis(data, sourceWidth, sourceHeight, "y");
    const cellBuckets = new Map<
      string,
      {
        row: number;
        col: number;
        count: number;
        red: number;
        green: number;
        blue: number;
      }
    >();

    for (let y = 0; y < sourceHeight; y++) {
      for (let x = 0; x < sourceWidth; x++) {
        const index = (y * sourceWidth + x) * 4;
        const keep = shouldKeepExpressionPixel(
          data[index],
          data[index + 1],
          data[index + 2],
          data[index + 3],
        );

        if (!keep) {
          continue;
        }

        const col = Math.floor((x - gridX.firstLine) / gridX.pitch);
        const row = Math.floor((y - gridY.firstLine) / gridY.pitch);
        const key = `${row},${col}`;
        const bucket =
          cellBuckets.get(key) ??
          {
            row,
            col,
            count: 0,
            red: 0,
            green: 0,
            blue: 0,
          };

        bucket.count += 1;
        bucket.red += data[index];
        bucket.green += data[index + 1];
        bucket.blue += data[index + 2];
        cellBuckets.set(key, bucket);
      }
    }

    // The source expression images are drawn as full grid cells. JPG compression
    // and faint grid edges can create 100-200 stray pixels in nearby cells, so
    // require a substantial part of the cell before treating it as real overlay.
    const minimumCellPixels = Math.max(
      320,
      Math.round(gridX.pitch * gridY.pitch * 0.3),
    );
    const occupiedCells = Array.from(cellBuckets.values()).filter(
      (bucket) => bucket.count >= minimumCellPixels,
    );

    if (!occupiedCells.length) {
      return { cells: [] };
    }

    const minRow = Math.min(...occupiedCells.map((cell) => cell.row));
    const minCol = Math.min(...occupiedCells.map((cell) => cell.col));
    const cells = occupiedCells.map((cell) => {
      const red = cell.red / cell.count;
      const green = cell.green / cell.count;
      const blue = cell.blue / cell.count;

      return {
        row: cell.row - minRow,
        col: cell.col - minCol,
        color: normalizeExpressionColor(src, red, green, blue),
      };
    });

    return { cells };
  })();

  faceOverlayCache.set(src, promise);
  return promise;
}

function paintFurAndOutline(
  canvas: HTMLCanvasElement,
  config: FlexibleRenderConfig,
  cellSize: number,
  paddingX = 0,
  paddingY = 0,
) {
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (config.backgroundColor === "white") {
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  FLEXIBLE_FUR_REGION_MAP.forEach((row, rowIndex) => {
    row.forEach((region, colIndex) => {
      if (region === "BG" || region === "OL") {
        return;
      }

      const color = FUR_ROLE_HEX[config.furRegionPlan[region]];

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

  FLEXIBLE_FUR_REGION_MAP.forEach((row, rowIndex) => {
    row.forEach((region, colIndex) => {
      if (region !== "OL") {
        return;
      }

      context.fillStyle = "#111111";
      context.fillRect(
        paddingX + colIndex * cellSize,
        paddingY + rowIndex * cellSize,
        cellSize,
        cellSize,
      );
    });
  });

  return context;
}

function drawSelectedRegion(
  canvas: HTMLCanvasElement,
  selectedRegion: RenderableFlexibleFurRegion | null | undefined,
  cellSize: number,
  paddingX = 0,
  paddingY = 0,
) {
  if (!selectedRegion) {
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.save();
  context.imageSmoothingEnabled = false;
  context.fillStyle = "rgba(255, 242, 184, 0.34)";
  context.strokeStyle = "#ff8fbc";
  context.lineWidth = Math.max(2, Math.round(cellSize / 8));

  FLEXIBLE_FUR_REGION_MAP.forEach((row, rowIndex) => {
    row.forEach((region, colIndex) => {
      if (region !== selectedRegion) {
        return;
      }

      const x = paddingX + colIndex * cellSize;
      const y = paddingY + rowIndex * cellSize;

      context.fillRect(x, y, cellSize, cellSize);
      context.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
    });
  });

  context.restore();
}

async function drawFaceOverlay(
  context: CanvasRenderingContext2D,
  preset: FaceFeaturePreset,
  cellSize: number,
  paddingX: number,
  paddingY: number,
  shouldContinue: () => boolean,
) {
  if (!preset.imageSrc) {
    return;
  }

  const overlay = await getProcessedFaceOverlay(preset.imageSrc);

  if (!shouldContinue()) {
    return;
  }

  context.imageSmoothingEnabled = false;
  overlay.cells.forEach((cell) => {
    context.fillStyle = cell.color;
    context.fillRect(
      paddingX + (preset.placement.col - 1 + cell.col) * cellSize,
      paddingY + (preset.placement.row - 1 + cell.row) * cellSize,
      cellSize,
      cellSize,
    );
  });
}

function drawAccessoryOverlay(
  context: CanvasRenderingContext2D,
  preset: AccessoryPreset,
  cellSize: number,
  paddingX: number,
  paddingY: number,
) {
  if (!preset.cells.length) {
    return;
  }

  context.imageSmoothingEnabled = false;
  preset.cells.forEach((cell) => {
    context.fillStyle = cell.color;
    context.fillRect(
      paddingX + (cell.col - 1) * cellSize,
      paddingY + (cell.row - 1) * cellSize,
      cellSize,
      cellSize,
    );
  });
}

async function paintFlexibleCat(
  canvas: HTMLCanvasElement,
  config: FlexibleRenderConfig,
  cellSize: number,
  paddingX = 0,
  paddingY = 0,
  shouldContinue = () => true,
) {
  const context = paintFurAndOutline(canvas, config, cellSize, paddingX, paddingY);

  if (!context || config.faceMode !== "features") {
    if (context) {
      drawAccessoryOverlay(
        context,
        getAccessoryPreset(config.accessoryPreset),
        cellSize,
        paddingX,
        paddingY,
      );
    }
    return;
  }

  drawAccessoryOverlay(
    context,
    getAccessoryPreset(config.accessoryPreset),
    cellSize,
    paddingX,
    paddingY,
  );

  const preset = getFaceFeaturePreset(config.faceFeaturePreset);
  await drawFaceOverlay(context, preset, cellSize, paddingX, paddingY, shouldContinue);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not create PNG blob."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

async function exportFlexibleCatBlob(
  config: FlexibleRenderConfig,
  exportSize: number,
) {
  const canvas = document.createElement("canvas");
  const metrics = getPixelCatCanvasMetrics(exportSize);

  canvas.width = exportSize;
  canvas.height = exportSize;

  await paintFlexibleCat(
    canvas,
    config,
    metrics.cellSize,
    metrics.paddingX,
    metrics.paddingY,
  );

  return canvasToBlob(canvas);
}

function downloadDataUrl(dataUrl: string) {
  const link = document.createElement("a");

  link.href = dataUrl;
  link.download = PIXEL_KITTY_FILENAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

const PIXEL_KITTY_FILENAME = "my-pixel-kitty.png";

function downloadBlob(blob: Blob): "downloaded" {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = PIXEL_KITTY_FILENAME;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}

function shouldUseNativeShare() {
  return window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
}

async function saveBlob(blob: Blob): Promise<"downloaded" | "shared"> {
  if (shouldUseNativeShare() && typeof navigator.share === "function") {
    const file = new File([blob], PIXEL_KITTY_FILENAME, { type: "image/png" });
    const shareData: ShareData = {
      files: [file],
      title: "My pixel kitty",
    };

    try {
      if (
        typeof navigator.canShare !== "function" ||
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
        return "shared";
      }
    } catch {
      // If native share is cancelled or unavailable, fall back to browser download.
    }
  }

  return downloadBlob(blob);
}

async function downloadCanvas(
  canvas: HTMLCanvasElement,
): Promise<"downloaded" | "shared"> {
  try {
    return await saveBlob(await canvasToBlob(canvas));
  } catch {
    downloadDataUrl(canvas.toDataURL("image/png"));
    return "downloaded";
  }
}

export const FlexibleCatRenderer = forwardRef<
  FlexibleCatRendererHandle,
  FlexibleCatRendererProps
>(function FlexibleCatRenderer(
  {
    config,
    cellSize = 24,
    exportSize = 1024,
    selectedRegion = null,
    onRegionSelect,
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    let active = true;

    if (!canvas) {
      return undefined;
    }

    const size = Math.max(FLEX_TEMPLATE_WIDTH, FLEX_TEMPLATE_HEIGHT) * cellSize;
    const metrics = getPixelCatCanvasMetrics(size);

    void (async () => {
      await paintFlexibleCat(
        canvas,
        config,
        metrics.cellSize,
        metrics.paddingX,
        metrics.paddingY,
        () => active,
      );

      if (active) {
        drawSelectedRegion(
          canvas,
          selectedRegion,
          metrics.cellSize,
          metrics.paddingX,
          metrics.paddingY,
        );
      }
    })();

    return () => {
      active = false;
    };
  }, [cellSize, config, selectedRegion]);

  function handleCanvasClick(event: MouseEvent<HTMLCanvasElement>) {
    if (!onRegionSelect) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    const metrics = getPixelCatCanvasMetrics(canvas.width);
    const col = Math.floor((x - metrics.paddingX) / metrics.cellSize);
    const row = Math.floor((y - metrics.paddingY) / metrics.cellSize);

    if (
      row < 0 ||
      row >= FLEX_TEMPLATE_HEIGHT ||
      col < 0 ||
      col >= FLEX_TEMPLATE_WIDTH
    ) {
      return;
    }

    const region = FLEXIBLE_FUR_REGION_MAP[row][col];

    if (region === "BG" || region === "OL") {
      return;
    }

    onRegionSelect(region as RenderableFlexibleFurRegion);
  }

  useImperativeHandle(
    ref,
    () => ({
      async downloadPng() {
        try {
          return await saveBlob(await exportFlexibleCatBlob(config, exportSize));
        } catch {
          const canvas = canvasRef.current;

          if (!canvas) {
            throw new Error("No pixel kitty canvas is ready.");
          }

          return await downloadCanvas(canvas);
        }
      },
    }),
    [config, exportSize],
  );

  return (
    <canvas
      ref={canvasRef}
      width={Math.max(FLEX_TEMPLATE_WIDTH, FLEX_TEMPLATE_HEIGHT) * cellSize}
      height={Math.max(FLEX_TEMPLATE_WIDTH, FLEX_TEMPLATE_HEIGHT) * cellSize}
      className={`aspect-square h-auto w-full max-w-[504px] [image-rendering:pixelated] ${
        onRegionSelect ? "cursor-crosshair" : ""
      }`}
      data-testid="pixel-cat-canvas"
      aria-label="Rendered pixel cat avatar. Click a fur area to recolor it."
      onClick={handleCanvasClick}
    />
  );
});
