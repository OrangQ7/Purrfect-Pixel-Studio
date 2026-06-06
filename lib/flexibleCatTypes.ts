import { COAT_PRESETS, PATTERN_SYMMETRIES, type CoatPreset } from "./colorRoles";
import type { AccessoryPresetId } from "./accessoryTemplate";
import type { FaceFeaturePresetId } from "./faceFeatureTemplate";
import {
  FLEXIBLE_RENDER_REGIONS,
  type FeatureRegion,
  type FlexibleFurRegion,
} from "./flexibleCatTemplate";

export const FUR_COLOR_ROLES = [
  "white",
  "warm_white",
  "peach_cream",
  "cream",
  "light_cream",
  "orange",
  "deep_orange",
  "golden",
  "brown",
  "dark_brown",
  "black",
  "near_black",
  "grey",
  "dark_grey",
  "blue_grey",
  "dark_blue_grey",
  "taupe",
  "pink",
  "none",
] as const;

export type FurColorRole = (typeof FUR_COLOR_ROLES)[number];

export const FEATURE_COLOR_ROLES = [
  "eye_black",
  "eye_dark_brown",
  "eye_blue",
  "eye_cyan",
  "eye_green",
  "eye_grey",
  "eye_yellow",
  "nose_pink",
  "nose_brown",
  "nose_black",
  "mouth_dark",
  "mouth_soft",
] as const;

export type FeatureColorRole = (typeof FEATURE_COLOR_ROLES)[number];

export const MODE_RECOMMENDATIONS = [
  "fixed_template",
  "flexible_template",
  "unknown",
] as const;

export type ModeRecommendation = (typeof MODE_RECOMMENDATIONS)[number];
export type Symmetry = (typeof PATTERN_SYMMETRIES)[number];
export type RenderableFlexibleFurRegion =
  (typeof FLEXIBLE_RENDER_REGIONS)[number];

export type MainColorRoles = {
  primary: FurColorRole;
  secondary: FurColorRole;
  accent: FurColorRole;
  point: FurColorRole;
  whiteArea: FurColorRole;
  innerEar: FurColorRole;
};

export type FurRegionPlan = Record<RenderableFlexibleFurRegion, FurColorRole>;
export type FeatureRegionPlan = Record<FeatureRegion, FeatureColorRole>;

export type FlexibleCatAnalysis = {
  analysisMode: "openai" | "mock" | "error";
  imageHash: string;
  modeRecommendation: ModeRecommendation;
  coatPreset: CoatPreset;
  symmetry: Symmetry;
  mainColorRoles: MainColorRoles;
  furRegionPlan: FurRegionPlan;
  featureRegionPlan: FeatureRegionPlan;
  description: string;
  confidence: number;
};

export type FlexibleRenderConfig = {
  backgroundColor: "white" | "transparent";
  accessoryPreset: AccessoryPresetId;
  faceMode: "faceless" | "features";
  faceFeaturePreset: FaceFeaturePresetId;
  furRegionPlan: FurRegionPlan;
  featureRegionPlan: FeatureRegionPlan;
};

export const FUR_ROLE_HEX: Record<FurColorRole, string> = {
  white: "#FFFFFF",
  warm_white: "#FFF8EA",
  peach_cream: "#F3C2A8",
  cream: "#F2E5C7",
  light_cream: "#F7EBD7",
  orange: "#E9832F",
  deep_orange: "#C95B1D",
  golden: "#D9A34A",
  brown: "#7B4D32",
  dark_brown: "#4A3328",
  black: "#3F444A",
  near_black: "#4F555E",
  grey: "#8D9298",
  dark_grey: "#4F555E",
  blue_grey: "#7B8794",
  dark_blue_grey: "#4D5868",
  taupe: "#9A8878",
  pink: "#F4A6A6",
  none: "transparent",
};

export const FEATURE_ROLE_HEX: Record<FeatureColorRole, string> = {
  eye_black: "#111111",
  eye_dark_brown: "#3B241E",
  eye_blue: "#4AA3D8",
  eye_cyan: "#24C7D8",
  eye_green: "#6EA44D",
  eye_grey: "#6F7B78",
  eye_yellow: "#DAB23F",
  nose_pink: "#F29CB3",
  nose_brown: "#7B4D32",
  nose_black: "#111111",
  mouth_dark: "#241817",
  mouth_soft: "#8B5A5A",
};

export const FUR_ROLE_LABELS: Record<FurColorRole, string> = {
  white: "White",
  warm_white: "Warm white",
  peach_cream: "Peach cream",
  cream: "Cream",
  light_cream: "Light cream",
  orange: "Orange",
  deep_orange: "Deep orange",
  golden: "Golden",
  brown: "Brown",
  dark_brown: "Dark brown",
  black: "Deep grey",
  near_black: "Soft deep grey",
  grey: "Grey",
  dark_grey: "Dark grey",
  blue_grey: "Blue grey",
  dark_blue_grey: "Dark blue grey",
  taupe: "Taupe",
  pink: "Pink",
  none: "None",
};

export const FEATURE_ROLE_LABELS: Record<FeatureColorRole, string> = {
  eye_black: "Eye black",
  eye_dark_brown: "Eye dark brown",
  eye_blue: "Eye blue",
  eye_cyan: "Eye cyan",
  eye_green: "Eye green",
  eye_grey: "Eye grey",
  eye_yellow: "Eye yellow",
  nose_pink: "Nose pink",
  nose_brown: "Nose brown",
  nose_black: "Nose black",
  mouth_dark: "Mouth dark",
  mouth_soft: "Mouth soft",
};

export const FLEXIBLE_REGION_LABELS: Record<
  RenderableFlexibleFurRegion,
  string
> = {
  LEO: "Left ear outer",
  LEI: "Left ear inner",
  REO: "Right ear outer",
  REI: "Right ear inner",
  FH: "Forehead",
  LFT: "Left forehead",
  RFT: "Right forehead",
  LOF: "Left outer face",
  LIF: "Left inner face",
  FCL: "Face center left",
  FCR: "Face center right",
  RIF: "Right inner face",
  ROF: "Right outer face",
  LEA: "Left eye-area fur",
  REA: "Right eye-area fur",
  MZ: "Muzzle",
  NZ: "Nose-zone fur",
  CHIN: "Chin",
  NU: "Neck upper",
  CH: "Chest",
  LSH: "Left shoulder",
  RSH: "Right shoulder",
  BU: "Body upper",
  LFL: "Left flank upper",
  RFL: "Right flank upper",
  BM: "Body middle",
  LFM: "Left flank middle",
  RFM: "Right flank middle",
  BE: "Belly",
  LBL: "Left belly lower",
  RBL: "Right belly lower",
  BD: "Body lower",
  LUA: "Left upper arm",
  LLA: "Left lower arm",
  RUA: "Right upper arm",
  RLA: "Right lower arm",
  LUL: "Left upper leg",
  LLL: "Left lower leg",
  RUL: "Right upper leg",
  RLL: "Right lower leg",
  LP: "Left paw",
  RP: "Right paw",
  TB: "Tail base",
  TM: "Tail middle",
  TT: "Tail tip",
};

export const FLEXIBLE_REGION_GROUPS: Array<{
  label: string;
  regions: RenderableFlexibleFurRegion[];
}> = [
  {
    label: "Face and ears",
    regions: [
      "LEO",
      "LEI",
      "REO",
      "REI",
      "FH",
      "LFT",
      "RFT",
      "LOF",
      "LIF",
      "FCL",
      "FCR",
      "RIF",
      "ROF",
      "LEA",
      "REA",
      "MZ",
      "NZ",
      "CHIN",
    ],
  },
  {
    label: "Body",
    regions: [
      "NU",
      "CH",
      "LSH",
      "RSH",
      "BU",
      "LFL",
      "RFL",
      "BM",
      "LFM",
      "RFM",
      "BE",
      "LBL",
      "RBL",
      "BD",
    ],
  },
  {
    label: "Legs and paws",
    regions: [
      "LUA",
      "LLA",
      "RUA",
      "RLA",
      "LUL",
      "LLL",
      "RUL",
      "RLL",
      "LP",
      "RP",
    ],
  },
  { label: "Tail", regions: ["TB", "TM", "TT"] },
];

export const DEFAULT_MAIN_COLOR_ROLES: MainColorRoles = {
  primary: "cream",
  secondary: "warm_white",
  accent: "orange",
  point: "taupe",
  whiteArea: "white",
  innerEar: "pink",
};

export const DEFAULT_FEATURE_REGION_PLAN: FeatureRegionPlan = {
  LEYE: "eye_black",
  REYE: "eye_black",
  NOSE: "nose_pink",
  MOUTH: "mouth_dark",
};

export const DEFAULT_FUR_REGION_PLAN: FurRegionPlan = {
  LEO: "cream",
  LEI: "pink",
  REO: "cream",
  REI: "pink",
  FH: "cream",
  LFT: "cream",
  RFT: "cream",
  LOF: "cream",
  LIF: "cream",
  FCL: "cream",
  FCR: "cream",
  RIF: "cream",
  ROF: "cream",
  LEA: "cream",
  REA: "cream",
  MZ: "warm_white",
  NZ: "warm_white",
  CHIN: "warm_white",
  NU: "cream",
  CH: "warm_white",
  LSH: "cream",
  RSH: "cream",
  BU: "cream",
  LFL: "cream",
  RFL: "cream",
  BM: "cream",
  LFM: "cream",
  RFM: "cream",
  BE: "warm_white",
  LBL: "cream",
  RBL: "cream",
  BD: "cream",
  LUA: "cream",
  LLA: "cream",
  RUA: "cream",
  RLA: "cream",
  LUL: "cream",
  LLL: "cream",
  RUL: "cream",
  RLL: "cream",
  LP: "warm_white",
  RP: "warm_white",
  TB: "cream",
  TM: "cream",
  TT: "cream",
};

export const DEFAULT_FLEXIBLE_ANALYSIS: FlexibleCatAnalysis = {
  analysisMode: "mock",
  imageHash: "local",
  modeRecommendation: "flexible_template",
  coatPreset: "orange_bicolor",
  symmetry: "mostly_symmetric",
  mainColorRoles: DEFAULT_MAIN_COLOR_ROLES,
  furRegionPlan: DEFAULT_FUR_REGION_PLAN,
  featureRegionPlan: DEFAULT_FEATURE_REGION_PLAN,
  description:
    "Local default flexible render: cream body with warm white muzzle, chest, belly, and paws.",
  confidence: 0.5,
};

export function isFurColorRole(value: unknown): value is FurColorRole {
  return (
    typeof value === "string" &&
    FUR_COLOR_ROLES.includes(value as FurColorRole)
  );
}

export function isFeatureColorRole(value: unknown): value is FeatureColorRole {
  return (
    typeof value === "string" &&
    FEATURE_COLOR_ROLES.includes(value as FeatureColorRole)
  );
}

function pickEnumValue<const Values extends readonly string[]>(
  value: unknown,
  values: Values,
  fallback: Values[number],
): Values[number] {
  return typeof value === "string" && values.includes(value)
    ? (value as Values[number])
    : fallback;
}

function pickText(value: unknown, fallback = "none") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function pickConfidence(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(1, value))
    : 0;
}

function normalizeFurRole(role: FurColorRole): FurColorRole {
  return role === "black" || role === "near_black" ? "dark_grey" : role;
}

function sanitizeMainColorRoles(value: unknown): MainColorRoles {
  const source =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  return {
    primary: normalizeFurRole(
      pickEnumValue(source.primary, FUR_COLOR_ROLES, "cream"),
    ),
    secondary: normalizeFurRole(
      pickEnumValue(source.secondary, FUR_COLOR_ROLES, "warm_white"),
    ),
    accent: normalizeFurRole(
      pickEnumValue(source.accent, FUR_COLOR_ROLES, "orange"),
    ),
    point: normalizeFurRole(
      pickEnumValue(source.point, FUR_COLOR_ROLES, "taupe"),
    ),
    whiteArea: normalizeFurRole(
      pickEnumValue(source.whiteArea, FUR_COLOR_ROLES, "white"),
    ),
    innerEar: normalizeFurRole(
      pickEnumValue(source.innerEar, FUR_COLOR_ROLES, "pink"),
    ),
  };
}

export function sanitizeFurRegionPlan(value: unknown): FurRegionPlan {
  const source =
    value && typeof value === "object"
      ? (value as Partial<Record<FlexibleFurRegion, unknown>>)
      : {};

  return FLEXIBLE_RENDER_REGIONS.reduce<FurRegionPlan>((plan, region) => {
    plan[region] = normalizeFurRole(
      isFurColorRole(source[region])
        ? source[region]
        : DEFAULT_FUR_REGION_PLAN[region],
    );
    return plan;
  }, {} as FurRegionPlan);
}

function sanitizeFeatureRegionPlan(value: unknown): FeatureRegionPlan {
  const source =
    value && typeof value === "object"
      ? (value as Partial<Record<FeatureRegion, unknown>>)
      : {};

  return {
    LEYE: isFeatureColorRole(source.LEYE) ? source.LEYE : "eye_black",
    REYE: isFeatureColorRole(source.REYE) ? source.REYE : "eye_black",
    NOSE: isFeatureColorRole(source.NOSE) ? source.NOSE : "nose_pink",
    MOUTH: isFeatureColorRole(source.MOUTH) ? source.MOUTH : "mouth_dark",
  };
}

export function sanitizeFlexibleCatAnalysis(
  value: unknown,
  imageHash = "unknown",
): FlexibleCatAnalysis {
  const source =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  return {
    analysisMode: pickEnumValue(
      source.analysisMode,
      ["openai", "mock", "error"] as const,
      "error",
    ),
    imageHash: pickText(source.imageHash, imageHash),
    modeRecommendation: pickEnumValue(
      source.modeRecommendation,
      MODE_RECOMMENDATIONS,
      "flexible_template",
    ),
    coatPreset: pickEnumValue(source.coatPreset, COAT_PRESETS, "unknown"),
    symmetry: pickEnumValue(source.symmetry, PATTERN_SYMMETRIES, "symmetric"),
    mainColorRoles: sanitizeMainColorRoles(source.mainColorRoles),
    furRegionPlan: sanitizeFurRegionPlan(source.furRegionPlan),
    featureRegionPlan: sanitizeFeatureRegionPlan(source.featureRegionPlan),
    description: pickText(source.description, "No flexible analysis returned."),
    confidence: pickConfidence(source.confidence),
  };
}
