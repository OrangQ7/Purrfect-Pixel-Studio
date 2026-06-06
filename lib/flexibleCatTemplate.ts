export const FLEX_TEMPLATE_WIDTH = 21;
export const FLEX_TEMPLATE_HEIGHT = 18;

/**
 * Flexible template region codes
 *
 * BG = background
 * OL = outline
 *
 * LEO = left ear outer
 * LEI = left ear inner
 * REO = right ear outer
 * REI = right ear inner
 *
 * FH = forehead center
 * LFT = left forehead transition
 * RFT = right forehead transition
 *
 * LOF = left outer face
 * LIF = left inner face
 * FCL = face center left
 * FCR = face center right
 * ROF = right outer face
 * RIF = right inner face
 *
 * LEA = left eye area fur
 * REA = right eye area fur
 * MZ = muzzle zone
 * NZ = nose surrounding fur
 * CHIN = chin fur
 *
 * NU = neck upper
 * CH = chest center
 * LSH = left shoulder
 * RSH = right shoulder
 * BU = body upper center
 * LFL = left flank upper
 * RFL = right flank upper
 * BM = body middle center
 * LFM = left flank middle
 * RFM = right flank middle
 * BE = belly center
 * LBL = left belly lower
 * RBL = right belly lower
 * BD = body lower center
 *
 * LUA = left upper arm
 * LLA = left lower arm
 * RUA = right upper arm
 * RLA = right lower arm
 * LUL = left upper leg
 * LLL = left lower leg
 * RUL = right upper leg
 * RLL = right lower leg
 *
 * LP = left paw
 * RP = right paw
 *
 * TB = tail base
 * TM = tail middle
 * TT = tail tip
 */
export type FlexibleFurRegion =
  | "BG"
  | "OL"
  | "LEO"
  | "LEI"
  | "REO"
  | "REI"
  | "FH"
  | "LFT"
  | "RFT"
  | "LOF"
  | "LIF"
  | "FCL"
  | "FCR"
  | "RIF"
  | "ROF"
  | "LEA"
  | "REA"
  | "MZ"
  | "NZ"
  | "CHIN"
  | "NU"
  | "CH"
  | "LSH"
  | "RSH"
  | "BU"
  | "LFL"
  | "RFL"
  | "BM"
  | "LFM"
  | "RFM"
  | "BE"
  | "LBL"
  | "RBL"
  | "BD"
  | "LUA"
  | "LLA"
  | "RUA"
  | "RLA"
  | "LUL"
  | "LLL"
  | "RUL"
  | "RLL"
  | "LP"
  | "RP"
  | "TB"
  | "TM"
  | "TT";

export type FeatureRegion = "LEYE" | "REYE" | "NOSE" | "MOUTH";

export type FlexibleTemplateCell = {
  row: number;
  col: number;
  region: FlexibleFurRegion;
};

export type FeatureCell = {
  row: number;
  col: number;
  feature: FeatureRegion;
};

/**
 * 21 columns x 18 rows flexible fur region map.
 * This is the single source of truth for Flexible Template Mode.
 */
export const FLEXIBLE_FUR_REGION_MAP: FlexibleFurRegion[][] = [
  ["BG","BG","BG","BG","OL","OL","BG","BG","BG","BG","BG","OL","OL","BG","BG","BG","BG","BG","BG","BG","BG"],
  ["BG","BG","BG","OL","LEO","LEI","OL","OL","BG","OL","OL","REI","REO","OL","BG","BG","BG","BG","BG","BG","BG"],
  ["BG","BG","OL","LEO","LEO","LFT","LFT","OL","OL","OL","RFT","RFT","REO","REO","OL","BG","BG","BG","BG","BG","BG"],
  ["BG","BG","OL","LOF","LOF","LIF","LEA","FH","FH","FH","REA","RIF","ROF","ROF","OL","BG","BG","BG","BG","BG","BG"],
  ["BG","OL","LOF","LOF","LIF","LEA","FCL","FCL","MZ","FCR","FCR","REA","RIF","ROF","ROF","OL","BG","BG","BG","BG","BG"],
  ["OL","OL","OL","LOF","LIF","LEA","FCL","NZ","MZ","NZ","FCR","REA","RIF","ROF","OL","OL","OL","BG","BG","BG","BG"],
  ["BG","OL","LOF","LOF","LIF","LEA","FCL","CHIN","CHIN","CHIN","FCR","REA","RIF","ROF","ROF","OL","BG","BG","BG","BG","BG"],
  ["OL","LSH","LSH","LFL","LFL","NU","NU","BU","BU","BU","NU","NU","RFL","RFL","RSH","RSH","OL","BG","BG","BG","BG"],
  ["OL","OL","LSH","LSH","LFL","CH","CH","CH","CH","CH","CH","CH","RFL","RSH","RSH","OL","OL","BG","BG","BG","BG"],
  ["BG","BG","OL","LFL","LFM","CH","CH","CH","BE","CH","CH","CH","RFM","RFL","OL","BG","BG","BG","BG","BG","BG"],
  ["BG","OL","LUA","LUA","LLA","LFM","BM","BM","BM","BM","BM","RFM","RLA","RUA","RUA","OL","BG","BG","OL","OL","BG"],
  ["BG","OL","LLA","LLA","LUL","LFM","BM","BM","BE","BE","BM","RFM","RUL","RLA","RLA","OL","BG","OL","TB","TM","OL"],
  ["BG","OL","LUL","LLL","LLL","LBL","BE","BE","BE","BE","BE","RBL","RLL","RUL","RUL","OL","OL","TB","TM","TT","OL"],
  ["BG","OL","LUL","LLL","LBL","LBL","BE","BE","BE","BE","OL","BE","RBL","RLL","RUL","OL","TB","TM","TT","OL","BG"],
  ["BG","BG","OL","LP","LP","LP","LP","OL","BD","OL","BD","RP","RP","RP","OL","TM","TM","TT","TT","OL","BG"],
  ["BG","BG","OL","LP","LP","LP","LP","LP","OL","BD","BD","RP","RP","RP","OL","TT","TT","OL","OL","BG","BG"],
  ["BG","BG","BG","OL","LP","LP","LP","LP","OL","RP","RP","RP","RP","OL","TT","TT","OL","OL","BG","BG","BG"],
  ["BG","BG","BG","BG","OL","OL","OL","OL","OL","OL","OL","OL","OL","OL","OL","OL","BG","BG","BG","BG","BG"],
];

export function mapFlexibleMatrixToCells(): FlexibleTemplateCell[] {
  const cells: FlexibleTemplateCell[] = [];

  for (let row = 0; row < FLEXIBLE_FUR_REGION_MAP.length; row++) {
    for (let col = 0; col < FLEXIBLE_FUR_REGION_MAP[row].length; col++) {
      cells.push({
        row: row + 1,
        col: col + 1,
        region: FLEXIBLE_FUR_REGION_MAP[row][col],
      });
    }
  }

  return cells;
}

export const FLEXIBLE_TEMPLATE_CELLS = mapFlexibleMatrixToCells();

/**
 * Feature overlays are separate from fur.
 * The fur under the eyes/nose/mouth still exists.
 * Features are drawn after fur.
 */
export const SIMPLE_FACE_FEATURE_CELLS: FeatureCell[] = [
  { row: 5, col: 6, feature: "LEYE" },
  { row: 5, col: 7, feature: "LEYE" },
  { row: 6, col: 6, feature: "LEYE" },
  { row: 6, col: 7, feature: "LEYE" },
  { row: 5, col: 11, feature: "REYE" },
  { row: 5, col: 12, feature: "REYE" },
  { row: 6, col: 11, feature: "REYE" },
  { row: 6, col: 12, feature: "REYE" },
  { row: 6, col: 9, feature: "NOSE" },
  { row: 7, col: 8, feature: "MOUTH" },
  { row: 7, col: 9, feature: "MOUTH" },
  { row: 7, col: 10, feature: "MOUTH" },
  { row: 7, col: 11, feature: "MOUTH" },
];

export const NO_FACE_FEATURE_CELLS: FeatureCell[] = [];

/**
 * Region clusters help the AI and renderer keep patterns coherent.
 * These are not individual cells. They are logical groups.
 */
export const FLEXIBLE_REGION_CLUSTERS = {
  leftFaceCluster: ["LEO", "LFT", "LOF", "LIF", "LEA", "FCL"],
  rightFaceCluster: ["REO", "RFT", "ROF", "RIF", "REA", "FCR"],
  muzzleCluster: ["MZ", "NZ", "CHIN"],
  foreheadCluster: ["FH", "LFT", "RFT"],
  leftArmCluster: ["LSH", "LUA", "LLA", "LUL", "LLL", "LP"],
  rightArmCluster: ["RSH", "RUA", "RLA", "RUL", "RLL", "RP"],
  leftBodyCluster: ["LFL", "LFM", "LBL"],
  rightBodyCluster: ["RFL", "RFM", "RBL"],
  centerBodyCluster: ["NU", "CH", "BU", "BM", "BE", "BD"],
  tailCluster: ["TB", "TM", "TT"],
} as const;

export const FLEXIBLE_RENDER_REGIONS = [
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
  "TB",
  "TM",
  "TT",
] as const satisfies readonly FlexibleFurRegion[];
