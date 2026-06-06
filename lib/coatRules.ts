import type { CellRegion } from "@/lib/catTemplate";
import type { CoatConfig } from "@/lib/colorRoles";

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const v = Math.max(0, Math.min(255, Math.round(x)));
        return v.toString(16).padStart(2, "0");
      })
      .join("")
  );
}

function mixHex(a: string, b: string, amountOfB = 0.5) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);

  return rgbToHex(
    ca.r * (1 - amountOfB) + cb.r * amountOfB,
    ca.g * (1 - amountOfB) + cb.g * amountOfB,
    ca.b * (1 - amountOfB) + cb.b * amountOfB,
  );
}

function isFur(region: CellRegion) {
  return region !== "BG" && region !== "OL";
}

function hasRegionColors(
  config: CoatConfig,
): config is CoatConfig & { regionColors: NonNullable<CoatConfig["regionColors"]> } {
  return Boolean(config.regionColors);
}

function isPointPreset(config: CoatConfig) {
  return [
    "colorpoint",
    "seal_point",
    "blue_point",
    "ragdoll_like_point",
  ].includes(config.coatPreset);
}

function isWhiteChestPreset(config: CoatConfig) {
  return [
    "orange_bicolor",
    "blue_white_bicolor",
    "dark_bicolor",
    "tuxedo",
  ].includes(config.coatPreset);
}

function getFiveRegionColor(
  region: CellRegion,
  config: CoatConfig & { regionColors: NonNullable<CoatConfig["regionColors"]> },
) {
  const { regionColors } = config;

  if (region === "BG") {
    return config.backgroundColor;
  }
  if (region === "OL") {
    return config.outlineColor;
  }
  if (["LE", "RE"].includes(region)) {
    return regionColors.earColor;
  }
  if (["TB", "TM", "TT"].includes(region)) {
    return regionColors.tailColor;
  }
  if (["LP", "RP"].includes(region)) {
    return regionColors.pawColor;
  }

  if (isPointPreset(config)) {
    if (["FC", "LIF", "RIF", "FH"].includes(region)) {
      return regionColors.faceColor;
    }
    if (["LOF", "ROF"].includes(region)) {
      return regionColors.bodyColor;
    }
  } else if (["FH", "LOF", "LIF", "FC", "RIF", "ROF"].includes(region)) {
    return regionColors.faceColor;
  }

  if (
    isWhiteChestPreset(config) &&
    ["CH", "BE", "BD"].includes(region) &&
    config.secondaryColor !== config.baseColor
  ) {
    return config.secondaryColor;
  }

  return regionColors.bodyColor;
}

function getColorpointRegionColor(region: CellRegion, config: CoatConfig) {
  const softPoint = mixHex(config.baseColor, config.pointColor, 0.65);
  const verySoftPoint = mixHex(config.baseColor, config.pointColor, 0.35);

  switch (region) {
    case "BG":
      return config.backgroundColor;
    case "OL":
      return config.outlineColor;
    case "LE":
    case "RE":
      return config.pointColor;
    case "FC":
      return config.pointColor;
    case "LIF":
    case "RIF":
      return softPoint;
    case "FH":
      return verySoftPoint;
    case "LOF":
    case "ROF":
      return config.baseColor;
    case "TB":
    case "TM":
    case "TT":
      return config.pointColor;
    case "LP":
    case "RP":
      return config.pointColor;
    case "LL":
    case "RL":
      return config.baseColor;
    case "NU":
    case "CH":
    case "BU":
    case "BM":
    case "BE":
    case "BD":
      return config.baseColor;
    default:
      return config.baseColor;
  }
}

function getRagdollPointRegionColor(region: CellRegion, config: CoatConfig) {
  const softPoint = mixHex(config.baseColor, config.pointColor, 0.55);
  const verySoftPoint = mixHex(config.baseColor, config.pointColor, 0.28);

  switch (region) {
    case "BG":
      return config.backgroundColor;
    case "OL":
      return config.outlineColor;
    case "LE":
    case "RE":
      return config.pointColor;
    case "FC":
      return softPoint;
    case "LIF":
    case "RIF":
      return verySoftPoint;
    case "FH":
      return verySoftPoint;
    case "LOF":
    case "ROF":
      return config.baseColor;
    case "TB":
    case "TM":
    case "TT":
      return config.pointColor;
    case "LP":
    case "RP":
      return softPoint;
    default:
      return isFur(region) ? config.baseColor : config.backgroundColor;
  }
}

function getSilverShadedRegionColor(region: CellRegion, config: CoatConfig) {
  if (region === "BG") {
    return config.backgroundColor;
  }
  if (region === "OL") {
    return config.outlineColor;
  }
  if (["LE", "RE", "FH", "LOF", "ROF", "BU", "TB", "TM", "TT"].includes(region)) {
    return config.secondaryColor;
  }
  if (["LIF", "RIF"].includes(region)) {
    return mixHex(config.baseColor, config.secondaryColor, 0.45);
  }
  return config.baseColor;
}

function getOrangeBicolorRegionColor(region: CellRegion, config: CoatConfig) {
  if (region === "BG") {
    return config.backgroundColor;
  }
  if (region === "OL") {
    return config.outlineColor;
  }
  if (["FC", "CH", "BE", "BD", "LP", "RP"].includes(region)) {
    return config.secondaryColor;
  }
  if (region === "TT") {
    return config.accentColor;
  }
  return config.baseColor;
}

function getTuxedoRegionColor(region: CellRegion, config: CoatConfig) {
  if (region === "BG") {
    return config.backgroundColor;
  }
  if (region === "OL") {
    return config.outlineColor;
  }
  if (["FC", "CH", "BE", "BD", "LP", "RP"].includes(region)) {
    return config.secondaryColor;
  }
  if (["LIF", "RIF"].includes(region)) {
    return config.secondaryColor;
  }
  return config.baseColor;
}

function getCalicoRegionColor(region: CellRegion, config: CoatConfig) {
  if (region === "BG") {
    return config.backgroundColor;
  }
  if (region === "OL") {
    return config.outlineColor;
  }
  if (["LE", "LOF", "LIF", "BU", "LL", "TB"].includes(region)) {
    return config.secondaryColor;
  }
  if (["RE", "ROF", "RIF", "TT", "RP"].includes(region)) {
    return config.accentColor;
  }
  return config.baseColor;
}

function getTabbyRegionColor(region: CellRegion, config: CoatConfig) {
  if (region === "BG") {
    return config.backgroundColor;
  }
  if (region === "OL") {
    return config.outlineColor;
  }
  if (["FH", "LOF", "ROF", "BU", "TB", "TM", "TT"].includes(region)) {
    return config.secondaryColor;
  }
  if (["LIF", "RIF"].includes(region)) {
    return mixHex(config.baseColor, config.secondaryColor, 0.45);
  }
  return config.baseColor;
}

export function getRegionColor(region: CellRegion, config: CoatConfig): string {
  if (region === "BG") {
    return config.backgroundColor;
  }
  if (region === "OL") {
    return config.outlineColor;
  }
  if (hasRegionColors(config)) {
    return getFiveRegionColor(region, config);
  }

  switch (config.coatPreset) {
    case "colorpoint":
    case "seal_point":
    case "blue_point":
      return getColorpointRegionColor(region, config);
    case "ragdoll_like_point":
      return getRagdollPointRegionColor(region, config);
    case "silver_shaded":
    case "chinchilla_shaded":
    case "golden_shaded":
    case "blue_golden_shaded":
      return getSilverShadedRegionColor(region, config);
    case "orange_bicolor":
    case "blue_white_bicolor":
      return getOrangeBicolorRegionColor(region, config);
    case "dark_bicolor":
    case "tuxedo":
      return getTuxedoRegionColor(region, config);
    case "calico_patch":
    case "dilute_calico":
    case "tortoiseshell":
      return getCalicoRegionColor(region, config);
    case "tabby_orange":
    case "tabby_grey":
    case "tabby_brown":
    case "tabby_mackerel":
    case "tabby_classic":
    case "tabby_spotted":
    case "torbie":
    case "patched_tabby":
      return getTabbyRegionColor(region, config);
    case "smoke":
      return region === "FC" || region === "CH" || region === "BE"
        ? config.secondaryColor
        : config.baseColor;
    case "solid_white":
    case "solid_black":
    case "solid_grey":
    case "solid_orange":
    case "unknown":
    default:
      return config.baseColor;
  }
}
