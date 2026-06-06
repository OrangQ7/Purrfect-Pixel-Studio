import { getFaceFeatureColor } from "./faceFeatureColors";
import {
  getFaceFeaturePreset,
  type FaceFeaturePresetId,
} from "./faceFeatureTemplate";

export type PixelCell = {
  row: number;
  col: number;
  color: string;
};

export function applyFaceFeatureOverlay(
  baseCells: PixelCell[],
  presetId: FaceFeaturePresetId,
): PixelCell[] {
  const preset = getFaceFeaturePreset(presetId);
  const map = new Map<string, PixelCell>();

  baseCells.forEach((cell) => {
    map.set(`${cell.row}-${cell.col}`, cell);
  });

  preset.cells.forEach((featureCell) => {
    const color = getFaceFeatureColor(presetId, featureCell.role);

    if (!color) {
      return;
    }

    map.set(`${featureCell.row}-${featureCell.col}`, {
      row: featureCell.row,
      col: featureCell.col,
      color,
    });
  });

  return Array.from(map.values());
}
