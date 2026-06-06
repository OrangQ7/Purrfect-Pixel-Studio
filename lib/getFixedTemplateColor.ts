import type { CellRegion } from "./catTemplate";
import { DEFAULT_FIXED_TEMPLATE_PALETTE } from "./fixedTemplateRoles";
import { FIXED_TEMPLATE_PRESETS } from "./fixedTemplatePresets";
import type { FixedTemplateId } from "./fixedTemplateFamilies";

export function getFixedTemplateCellColor(
  templateId: FixedTemplateId,
  row: number,
  col: number,
  region: CellRegion
): string {
  const preset = FIXED_TEMPLATE_PRESETS[templateId];
  const palette = DEFAULT_FIXED_TEMPLATE_PALETTE;

  const key = `${row},${col}`;

  if (preset.cellOverrides && preset.cellOverrides[key]) {
    return palette[preset.cellOverrides[key]];
  }

  const role = preset.regionRoles[region] ?? "bg";
  return palette[role];
}
