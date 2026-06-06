import type { FeatureRegion } from "./flexibleCatTemplate";
import type { FeatureColorRole, FeatureRegionPlan } from "./flexibleCatTypes";

export const EXPRESSION_PRESET_IDS = [
  "faceless",
  "yellow_eyes",
  "blue_eyes",
  "green_eyes",
  "odd_yellow_blue",
  "grey_eyes",
  "black_simple",
  "dot_cute",
  "sleepy",
] as const;

export type ExpressionPresetId = (typeof EXPRESSION_PRESET_IDS)[number];

export type ExpressionFeatureCell = {
  row: number;
  col: number;
  feature: FeatureRegion;
  colorRole?: FeatureColorRole;
};

export type ExpressionPresetDefinition = {
  id: ExpressionPresetId;
  label: string;
  description: string;
  cells: ExpressionFeatureCell[];
  defaultFeaturePlan: FeatureRegionPlan;
  previewRoles: FeatureColorRole[];
};

export const DEFAULT_EXPRESSION_PRESET: ExpressionPresetId = "faceless";

const darkNoseMouth: FeatureRegionPlan = {
  LEYE: "eye_black",
  REYE: "eye_black",
  NOSE: "nose_black",
  MOUTH: "mouth_dark",
};

const compactNoseMouthCells: ExpressionFeatureCell[] = [
  { row: 6, col: 9, feature: "NOSE" },
  { row: 6, col: 10, feature: "NOSE" },
  { row: 7, col: 9, feature: "MOUTH" },
  { row: 7, col: 10, feature: "MOUTH" },
];

function verticalColorEyeCells(): ExpressionFeatureCell[] {
  return [
    { row: 5, col: 6, feature: "LEYE" },
    { row: 6, col: 6, feature: "LEYE" },
    { row: 5, col: 7, feature: "LEYE", colorRole: "eye_black" },
    { row: 6, col: 7, feature: "LEYE", colorRole: "eye_black" },
    { row: 5, col: 11, feature: "REYE", colorRole: "eye_black" },
    { row: 6, col: 11, feature: "REYE", colorRole: "eye_black" },
    { row: 5, col: 12, feature: "REYE" },
    { row: 6, col: 12, feature: "REYE" },
    ...compactNoseMouthCells,
  ];
}

const blackSimpleCells: ExpressionFeatureCell[] = [
  { row: 5, col: 6, feature: "LEYE" },
  { row: 6, col: 6, feature: "LEYE" },
  { row: 5, col: 12, feature: "REYE" },
  { row: 6, col: 12, feature: "REYE" },
  ...compactNoseMouthCells,
];

const dotCuteCells: ExpressionFeatureCell[] = [
  { row: 5, col: 6, feature: "LEYE" },
  { row: 5, col: 12, feature: "REYE" },
  { row: 6, col: 9, feature: "NOSE" },
  { row: 6, col: 10, feature: "NOSE" },
  { row: 7, col: 9, feature: "MOUTH" },
  { row: 7, col: 10, feature: "MOUTH" },
];

const sleepyCells: ExpressionFeatureCell[] = [
  { row: 5, col: 6, feature: "LEYE" },
  { row: 5, col: 7, feature: "LEYE" },
  { row: 5, col: 11, feature: "REYE" },
  { row: 5, col: 12, feature: "REYE" },
  { row: 6, col: 9, feature: "NOSE" },
  { row: 6, col: 10, feature: "NOSE" },
  { row: 7, col: 9, feature: "MOUTH" },
  { row: 7, col: 10, feature: "MOUTH" },
];

export const EXPRESSION_PRESETS: ExpressionPresetDefinition[] = [
  {
    id: "faceless",
    label: "No face",
    description: "Keep only the coat colors and outline.",
    cells: [],
    defaultFeaturePlan: darkNoseMouth,
    previewRoles: [],
  },
  {
    id: "yellow_eyes",
    label: "Golden eyes",
    description: "Yellow vertical eyes with a dark nose and mouth.",
    cells: verticalColorEyeCells(),
    defaultFeaturePlan: {
      ...darkNoseMouth,
      LEYE: "eye_yellow",
      REYE: "eye_yellow",
    },
    previewRoles: ["eye_yellow", "eye_black", "nose_black"],
  },
  {
    id: "blue_eyes",
    label: "Clear blue eyes",
    description: "Blue vertical eyes with a dark nose and mouth.",
    cells: verticalColorEyeCells(),
    defaultFeaturePlan: {
      ...darkNoseMouth,
      LEYE: "eye_blue",
      REYE: "eye_blue",
    },
    previewRoles: ["eye_blue", "eye_black", "nose_black"],
  },
  {
    id: "green_eyes",
    label: "Bright green eyes",
    description: "Green vertical eyes with a dark nose and mouth.",
    cells: verticalColorEyeCells(),
    defaultFeaturePlan: {
      ...darkNoseMouth,
      LEYE: "eye_green",
      REYE: "eye_green",
    },
    previewRoles: ["eye_green", "eye_black", "nose_black"],
  },
  {
    id: "odd_yellow_blue",
    label: "Odd eyes",
    description: "One yellow eye and one blue eye with a dark nose and mouth.",
    cells: verticalColorEyeCells(),
    defaultFeaturePlan: {
      ...darkNoseMouth,
      LEYE: "eye_yellow",
      REYE: "eye_blue",
    },
    previewRoles: ["eye_yellow", "eye_blue", "nose_black"],
  },
  {
    id: "grey_eyes",
    label: "Soft grey eyes",
    description: "Grey vertical eyes with a dark nose and mouth.",
    cells: verticalColorEyeCells(),
    defaultFeaturePlan: {
      ...darkNoseMouth,
      LEYE: "eye_grey",
      REYE: "eye_grey",
    },
    previewRoles: ["eye_grey", "eye_black", "nose_black"],
  },
  {
    id: "black_simple",
    label: "Classic black eyes",
    description: "Simple black vertical eyes.",
    cells: blackSimpleCells,
    defaultFeaturePlan: darkNoseMouth,
    previewRoles: ["eye_black", "nose_black"],
  },
  {
    id: "dot_cute",
    label: "Bean eyes",
    description: "Small black bean eyes for a soft expression.",
    cells: dotCuteCells,
    defaultFeaturePlan: darkNoseMouth,
    previewRoles: ["eye_black", "mouth_dark"],
  },
  {
    id: "sleepy",
    label: "Sleepy eyes",
    description: "Horizontal sleepy eyes for a lazy expression.",
    cells: sleepyCells,
    defaultFeaturePlan: darkNoseMouth,
    previewRoles: ["eye_black", "mouth_dark"],
  },
];

export const EXPRESSION_PRESET_LABELS: Record<ExpressionPresetId, string> =
  Object.fromEntries(
    EXPRESSION_PRESETS.map((preset) => [preset.id, preset.label]),
  ) as Record<ExpressionPresetId, string>;

export function isExpressionPresetId(value: unknown): value is ExpressionPresetId {
  return (
    typeof value === "string" &&
    EXPRESSION_PRESET_IDS.includes(value as ExpressionPresetId)
  );
}

export function getExpressionPreset(
  id: ExpressionPresetId,
): ExpressionPresetDefinition {
  return (
    EXPRESSION_PRESETS.find((preset) => preset.id === id) ??
    EXPRESSION_PRESETS[0]
  );
}

export function getExpressionFeatureCells(
  id: ExpressionPresetId,
): ExpressionFeatureCell[] {
  return getExpressionPreset(id).cells;
}

export function getExpressionFeaturePlan(
  id: ExpressionPresetId,
): FeatureRegionPlan {
  return { ...getExpressionPreset(id).defaultFeaturePlan };
}
