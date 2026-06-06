"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

type NamePlateTheme = {
  id: string;
  label: string;
  description: string;
  fills: string[];
  shadows: string[];
  background: string;
  grid: string;
};

type NameCell = {
  x: number;
  y: number;
  owner: number;
};

const EXPORT_SCALE = 4;
const MAX_NAME_LENGTH = 10;
const BEAD_SIZE = 10;
const GLYPH_HEIGHT = 7;
const LETTER_GAP = 1;
const PADDING = 3;
const SHADOW_OFFSET = 1;

const BEAD_ALPHABET: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10011", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["111", "010", "010", "010", "010", "010", "111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "01010", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "01010", "00100", "00100", "00100", "01010", "10001"],
  Y: ["10001", "01010", "00100", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
};

const NAME_THEMES: NamePlateTheme[] = [
  {
    background: "#FFFDF8",
    description: "Purple bead alphabet.",
    fills: ["#8E5AD8"],
    grid: "rgba(35, 31, 38, 0.38)",
    id: "grape",
    label: "Grape",
    shadows: ["#5F3E99"],
  },
  {
    background: "#FFFDF8",
    description: "Soft blue letters.",
    fills: ["#5CA7DA"],
    grid: "rgba(35, 31, 38, 0.32)",
    id: "blue",
    label: "Blue",
    shadows: ["#3F7196"],
  },
  {
    background: "#FFFDF8",
    description: "Mint green letters.",
    fills: ["#73CFAD"],
    grid: "rgba(35, 31, 38, 0.3)",
    id: "mint",
    label: "Mint",
    shadows: ["#4D947D"],
  },
  {
    background: "#FFFDF8",
    description: "Creamy yellow letters.",
    fills: ["#F1C864"],
    grid: "rgba(35, 31, 38, 0.32)",
    id: "honey",
    label: "Honey",
    shadows: ["#B88B38"],
  },
  {
    background: "#FFFDF8",
    description: "Gentle coral letters.",
    fills: ["#EF766E"],
    grid: "rgba(35, 31, 38, 0.32)",
    id: "coral",
    label: "Coral",
    shadows: ["#B54E4A"],
  },
  {
    background: "#FFFDF8",
    description: "Mixed toy colors.",
    fills: ["#EF766E", "#5E83E6", "#74CFA8", "#F1C864"],
    grid: "rgba(35, 31, 38, 0.32)",
    id: "candy",
    label: "Candy",
    shadows: ["#B54E4A", "#3E57A9", "#4D947D", "#B88B38"],
  },
];

function sanitizeName(value: string) {
  return value.replace(/[^a-zA-Z]/g, "").slice(0, MAX_NAME_LENGTH);
}

function getRenderName(value: string) {
  const sanitized = sanitizeName(value || "Kitty");
  const name = sanitized || "Kitty";
  return name.toUpperCase();
}

function glyphWidth(glyph: string[]) {
  return Math.max(...glyph.map((row) => row.length));
}

function getNameCells(rawName: string) {
  const name = getRenderName(rawName);
  const cells: NameCell[] = [];
  let cursorX = PADDING;

  Array.from(name).forEach((letter, owner) => {
    const glyph = BEAD_ALPHABET[letter] ?? BEAD_ALPHABET.A;
    const width = glyphWidth(glyph);

    for (let y = 0; y < GLYPH_HEIGHT; y++) {
      const row = glyph[y] ?? "";

      for (let x = 0; x < row.length; x++) {
        if (row[x] === "1") {
          cells.push({ owner, x: cursorX + x, y: PADDING + y });
        }
      }
    }

    cursorX += width + LETTER_GAP;
  });

  return {
    cells,
    columns: cursorX - LETTER_GAP + PADDING + SHADOW_OFFSET,
    rows: GLYPH_HEIGHT + PADDING * 2 + SHADOW_OFFSET,
  };
}

function keyOf(x: number, y: number) {
  return `${x},${y}`;
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  beadSize: number,
) {
  ctx.fillStyle = color;
  ctx.fillRect(x * beadSize, y * beadSize, beadSize, beadSize);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  columns: number,
  rows: number,
  theme: NamePlateTheme,
  beadSize: number,
) {
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = Math.max(1, beadSize / BEAD_SIZE);

  for (let x = 0; x <= columns; x++) {
    ctx.beginPath();
    ctx.moveTo(x * beadSize, 0);
    ctx.lineTo(x * beadSize, rows * beadSize);
    ctx.stroke();
  }

  for (let y = 0; y <= rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * beadSize);
    ctx.lineTo(columns * beadSize, y * beadSize);
    ctx.stroke();
  }
}

function drawNamePlate(
  canvas: HTMLCanvasElement,
  rawName: string,
  theme: NamePlateTheme,
  scale = 1,
) {
  const beadSize = BEAD_SIZE * scale;
  const { cells, columns, rows } = getNameCells(rawName);
  const frontKeys = new Set(cells.map((cell) => keyOf(cell.x, cell.y)));

  canvas.width = columns * beadSize;
  canvas.height = rows * beadSize;

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const ctx = context;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  cells.forEach((cell) => {
    const shadowColor = theme.shadows[cell.owner % theme.shadows.length] ?? "#5F3E99";
    const shadowCells = [
      { x: cell.x + SHADOW_OFFSET, y: cell.y },
      { x: cell.x, y: cell.y + SHADOW_OFFSET },
      { x: cell.x + SHADOW_OFFSET, y: cell.y + SHADOW_OFFSET },
    ];

    shadowCells.forEach((shadowCell) => {
      if (!frontKeys.has(keyOf(shadowCell.x, shadowCell.y))) {
        drawCell(ctx, shadowCell.x, shadowCell.y, shadowColor, beadSize);
      }
    });
  });

  cells.forEach((cell) => {
    const fillColor = theme.fills[cell.owner % theme.fills.length] ?? "#8E5AD8";
    drawCell(ctx, cell.x, cell.y, fillColor, beadSize);
  });

  drawGrid(ctx, columns, rows, theme, beadSize);
}

function saveCanvas(canvas: HTMLCanvasElement, name: string) {
  canvas.toBlob((blob) => {
    if (!blob) {
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${sanitizeName(name || "kitty").toLowerCase()}-bead-name.png`;
    link.href = url;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

export function NamePlateStudio() {
  const [name, setName] = useState("Luna");
  const [themeId, setThemeId] = useState(NAME_THEMES[0].id);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = useMemo(
    () => NAME_THEMES.find((item) => item.id === themeId) ?? NAME_THEMES[0],
    [themeId],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    drawNamePlate(canvas, name, theme);
  }, [name, theme]);

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(sanitizeName(event.target.value));
  }

  function handleSave() {
    const exportCanvas = document.createElement("canvas");
    drawNamePlate(exportCanvas, name, theme, EXPORT_SCALE);
    saveCanvas(exportCanvas, name);
  }

  return (
    <div className="relative z-10 mx-auto grid max-w-7xl gap-5 lg:grid-cols-[360px_1fr]">
      <section className="pixel-grid-card rounded-[28px] border border-white/70 bg-white/58 p-6 shadow-[0_20px_60px_rgba(70,105,160,0.18)]">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5887c6]">
          Bead Name Studio
        </p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-[#171313]">
          Make a tiny bead name
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6f5d57]">
          Type an English name and save a compact bead alphabet chart.
        </p>

        <label
          className="mt-6 block text-sm font-black text-[#5b4d48]"
          htmlFor="name-tag-input"
        >
          Name
        </label>
        <input
          id="name-tag-input"
          className="mt-2 w-full rounded-2xl border border-[#ead7c9] bg-white/92 px-4 py-3 text-xl font-black tracking-[0.02em] text-[#211817] shadow-inner"
          maxLength={MAX_NAME_LENGTH}
          value={name}
          onChange={handleNameChange}
          placeholder="Luna"
        />
        <p className="mt-2 text-xs font-bold text-[#7b716b]">
          English letters only. Max {MAX_NAME_LENGTH} letters.
        </p>

        <div className="mt-6 rounded-[24px] border border-white/80 bg-[#fff7fb]/82 p-4 shadow-inner">
          <h2 className="text-base font-black text-[#171313]">Bead colors</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {NAME_THEMES.map((item) => (
              <button
                key={item.id}
                className={`sticker-button rounded-[20px] border p-3 text-left transition ${
                  themeId === item.id
                    ? "is-selected border-[#211817] bg-[#fff2b8]"
                    : "border-white bg-white/86"
                }`}
                type="button"
                onClick={() => setThemeId(item.id)}
              >
                <span className="block text-sm font-black text-[#211817]">
                  {item.label}
                </span>
                <span className="mt-1 block text-xs font-bold text-[#7b716b]">
                  {item.description}
                </span>
                <span className="mt-2 flex gap-1">
                  {item.fills.map((color, index) => (
                    <span
                      key={`${item.id}-${color}-${index}`}
                      className="h-5 w-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="cute-save-button mt-6 w-full px-4 py-3 text-base font-black"
          type="button"
          onClick={handleSave}
        >
          Save bead name
        </button>
      </section>

      <section className="pixel-grid-card flex min-h-[520px] flex-col items-center justify-center rounded-[28px] border border-white/70 bg-white/58 p-6 shadow-[0_20px_60px_rgba(70,105,160,0.18)]">
        <div className="nameplate-stage flex w-full flex-1 items-center justify-center rounded-[30px] p-6">
          <canvas
            ref={canvasRef}
            className="max-w-full rounded-[18px] border-4 border-white shadow-[0_18px_45px_rgba(70,105,160,0.2)]"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      </section>
    </div>
  );
}
