export const COAT_PRESETS = [
  "solid_white",
  "solid_black",
  "solid_grey",
  "solid_orange",
  "colorpoint",
  "ragdoll_like_point",
  "seal_point",
  "blue_point",
  "silver_shaded",
  "golden_shaded",
  "blue_golden_shaded",
  "chinchilla_shaded",
  "smoke",
  "orange_bicolor",
  "blue_white_bicolor",
  "dark_bicolor",
  "tuxedo",
  "calico_patch",
  "dilute_calico",
  "tortoiseshell",
  "torbie",
  "tabby_orange",
  "tabby_grey",
  "tabby_brown",
  "tabby_mackerel",
  "tabby_classic",
  "tabby_spotted",
  "patched_tabby",
  "unknown",
] as const;

export type CoatPreset = (typeof COAT_PRESETS)[number];

export type PatternSymmetry = "symmetric" | "mostly_symmetric" | "asymmetric";
export const PATTERN_SYMMETRIES = [
  "symmetric",
  "mostly_symmetric",
  "asymmetric",
] as const;

export type FacePattern =
  | "none"
  | "soft_mask"
  | "full_mask"
  | "center_white"
  | "side_patches"
  | "shaded_sides"
  | "tabby_m_mark";
export const FACE_PATTERNS = [
  "none",
  "soft_mask",
  "full_mask",
  "center_white",
  "side_patches",
  "shaded_sides",
  "tabby_m_mark",
] as const;

export type EarPattern =
  | "same_as_body"
  | "darker_ears"
  | "shaded_ears"
  | "pink_inner_only";
export const EAR_PATTERNS = [
  "same_as_body",
  "darker_ears",
  "shaded_ears",
  "pink_inner_only",
] as const;

export type TailPattern =
  | "same_as_body"
  | "dark_tail"
  | "gradient_tail"
  | "patchy_tail"
  | "ringed_tail";
export const TAIL_PATTERNS = [
  "same_as_body",
  "dark_tail",
  "gradient_tail",
  "patchy_tail",
  "ringed_tail",
] as const;

export type PawPattern =
  | "same_as_body"
  | "dark_paws"
  | "white_paws"
  | "light_paws";
export const PAW_PATTERNS = [
  "same_as_body",
  "dark_paws",
  "white_paws",
  "light_paws",
] as const;

export type AppearanceAnalysis = {
  analysisMode: "openai" | "mock" | "error";
  imageHash: string;
  coatPreset: CoatPreset;
  regionColors: FiveRegionColors;
  baseColorSemantic: string;
  pointColorSemantic: string;
  secondaryColorSemantic: string;
  accentColorSemantic: string;
  patternSymmetry: PatternSymmetry;
  facePattern: FacePattern;
  earPattern: EarPattern;
  tailPattern: TailPattern;
  pawPattern: PawPattern;
  breedLikeHint: string;
  description: string;
  confidence: number;
};

export type FiveRegionColors = {
  faceColor: string;
  earColor: string;
  bodyColor: string;
  pawColor: string;
  tailColor: string;
};

export type ColorRoles = {
  backgroundColor: string;
  outlineColor: string;
  baseColor: string;
  pointColor: string;
  secondaryColor: string;
  accentColor: string;
  innerEarColor: string;
};

export type CoatConfig = ColorRoles & {
  coatPreset: CoatPreset;
  regionColors?: FiveRegionColors;
  patternSymmetry?: PatternSymmetry;
  facePattern?: FacePattern;
  earPattern?: EarPattern;
  tailPattern?: TailPattern;
  pawPattern?: PawPattern;
};

export const DEFAULT_COLOR_ROLES: ColorRoles = {
  backgroundColor: "#FFFFFF",
  outlineColor: "#111111",
  baseColor: "#F2E5C7",
  pointColor: "#6F7686",
  secondaryColor: "#FFF8EA",
  accentColor: "#D8893A",
  innerEarColor: "#F4A6A6",
};

export const DEFAULT_REGION_COLORS: FiveRegionColors = {
  faceColor: DEFAULT_COLOR_ROLES.pointColor,
  earColor: DEFAULT_COLOR_ROLES.pointColor,
  bodyColor: DEFAULT_COLOR_ROLES.baseColor,
  pawColor: DEFAULT_COLOR_ROLES.pointColor,
  tailColor: DEFAULT_COLOR_ROLES.pointColor,
};

export function isCoatPreset(value: unknown): value is CoatPreset {
  return typeof value === "string" && COAT_PRESETS.includes(value as CoatPreset);
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

function pickHex(value: unknown, fallback: string) {
  return typeof value === "string" ? normalizeHexColor(value, fallback) : fallback;
}

function sanitizeRegionColors(value: unknown): FiveRegionColors {
  const source =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  return {
    faceColor: pickHex(source.faceColor, DEFAULT_REGION_COLORS.faceColor),
    earColor: pickHex(source.earColor, DEFAULT_REGION_COLORS.earColor),
    bodyColor: pickHex(source.bodyColor, DEFAULT_REGION_COLORS.bodyColor),
    pawColor: pickHex(source.pawColor, DEFAULT_REGION_COLORS.pawColor),
    tailColor: pickHex(source.tailColor, DEFAULT_REGION_COLORS.tailColor),
  };
}

export function sanitizeAppearanceAnalysis(value: unknown): AppearanceAnalysis {
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
    imageHash: pickText(source.imageHash, "unknown"),
    coatPreset: pickEnumValue(source.coatPreset, COAT_PRESETS, "unknown"),
    regionColors: sanitizeRegionColors(source.regionColors),
    baseColorSemantic: pickText(source.baseColorSemantic, "unknown"),
    pointColorSemantic: pickText(source.pointColorSemantic),
    secondaryColorSemantic: pickText(source.secondaryColorSemantic),
    accentColorSemantic: pickText(source.accentColorSemantic),
    patternSymmetry: pickEnumValue(
      source.patternSymmetry,
      PATTERN_SYMMETRIES,
      "symmetric",
    ),
    facePattern: pickEnumValue(source.facePattern, FACE_PATTERNS, "none"),
    earPattern: pickEnumValue(source.earPattern, EAR_PATTERNS, "same_as_body"),
    tailPattern: pickEnumValue(source.tailPattern, TAIL_PATTERNS, "same_as_body"),
    pawPattern: pickEnumValue(source.pawPattern, PAW_PATTERNS, "same_as_body"),
    breedLikeHint: pickText(source.breedLikeHint),
    description: pickText(source.description, "No description available."),
    confidence: pickConfidence(source.confidence),
  };
}

export function normalizeHexColor(value: string, fallback: string) {
  const trimmed = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return fallback;
}

const semanticColorMap: Array<[RegExp, string]> = [
  [/transparent/i, "transparent"],
  [/black|near-black|charcoal/i, "#1A1A1A"],
  [/blue.?grey|blue.?gray|soft blue|dilute grey|dilute gray/i, "#7B8794"],
  [/dark grey|dark gray|slate/i, "#4F555E"],
  [/silver|cool grey|cool gray/i, "#C4C8C8"],
  [/grey|gray/i, "#8D9298"],
  [/warm cream|cream|ivory/i, "#F2E5C7"],
  [/warm white|off white|off-white/i, "#FFF8EA"],
  [/white/i, "#FFFFFF"],
  [/seal brown|dark brown|espresso/i, "#4A3328"],
  [/brown|chocolate/i, "#7B4D32"],
  [/golden|gold/i, "#D9A34A"],
  [/ginger|orange|red/i, "#E9832F"],
  [/tan|beige/i, "#C99B68"],
  [/pale orange|apricot/i, "#EAB36A"],
  [/pink/i, "#F4A6A6"],
];

export function semanticColorToHex(semanticColor: string, fallback: string) {
  const matched = semanticColorMap.find(([pattern]) =>
    pattern.test(semanticColor),
  );
  return matched ? matched[1] : fallback;
}

function pickFromRegionPalette(
  regionColors: FiveRegionColors,
  preferredColor: string,
  fallbackColor: string,
) {
  const normalizedPreferred = normalizeHexColor(preferredColor, fallbackColor);
  const allowedColors = new Set(Object.values(regionColors));

  return allowedColors.has(normalizedPreferred)
    ? normalizedPreferred
    : fallbackColor;
}

export function createColorRolesFromAnalysis(
  analysis: AppearanceAnalysis | null,
  backgroundColor = DEFAULT_COLOR_ROLES.backgroundColor,
): ColorRoles {
  if (!analysis) {
    return { ...DEFAULT_COLOR_ROLES, backgroundColor };
  }

  const secondaryCandidate =
    analysis.secondaryColorSemantic === "none"
      ? analysis.regionColors.bodyColor
      : semanticColorToHex(
          analysis.secondaryColorSemantic,
          analysis.regionColors.bodyColor,
        );
  const accentCandidate =
    analysis.accentColorSemantic === "none"
      ? analysis.regionColors.tailColor
      : semanticColorToHex(
          analysis.accentColorSemantic,
          analysis.regionColors.tailColor,
        );

  return {
    backgroundColor,
    outlineColor: DEFAULT_COLOR_ROLES.outlineColor,
    baseColor: analysis.regionColors.bodyColor,
    pointColor: analysis.regionColors.faceColor,
    secondaryColor: pickFromRegionPalette(
      analysis.regionColors,
      secondaryCandidate,
      analysis.regionColors.bodyColor,
    ),
    accentColor: pickFromRegionPalette(
      analysis.regionColors,
      accentCandidate,
      analysis.regionColors.tailColor,
    ),
    innerEarColor: DEFAULT_COLOR_ROLES.innerEarColor,
  };
}
