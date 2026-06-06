export type AccessoryPresetId =
  | "none"
  | "gold_crown"
  | "red_scarf"
  | "star_collar"
  | "green_bow"
  | "pink_side_bow"
  | "blue_bow_tie"
  | "cherry_clip";

export type AccessoryCell = {
  row: number;
  col: number;
  color: string;
};

export type AccessoryPreset = {
  id: AccessoryPresetId;
  label: string;
  description: string;
  cells: AccessoryCell[];
};

const GOLD = "#E5AD2E";
const LIGHT_GOLD = "#F7E45B";
const BLUE_GEM = "#55C9E8";
const RED = "#C9082F";
const DARK_RED = "#7E1828";
const GREEN = "#229B56";
const LIGHT_GREEN = "#B8E457";
const BROWN = "#6D4938";
const PINK = "#F4A6B7";
const LIGHT_PINK = "#FFD0DC";
const BLUE = "#3F9BD7";
const DARK_BLUE = "#1F5D9C";
const CHERRY_RED = "#D92E38";
const LEAF_GREEN = "#2FAE62";

export const ACCESSORY_PRESETS: Record<AccessoryPresetId, AccessoryPreset> = {
  none: {
    id: "none",
    label: "No charm",
    description: "No accessory overlay.",
    cells: [],
  },
  gold_crown: {
    id: "gold_crown",
    label: "Golden crown",
    description: "A tiny crown for the top of the head.",
    cells: [
      { row: -2, col: 9, color: BLUE_GEM },
      { row: -1, col: 6, color: GOLD },
      { row: -1, col: 7, color: GOLD },
      { row: -1, col: 9, color: GOLD },
      { row: -1, col: 11, color: GOLD },
      { row: -1, col: 12, color: GOLD },
      { row: 0, col: 6, color: GOLD },
      { row: 0, col: 7, color: LIGHT_GOLD },
      { row: 0, col: 8, color: GOLD },
      { row: 0, col: 9, color: LIGHT_GOLD },
      { row: 0, col: 10, color: GOLD },
      { row: 0, col: 11, color: LIGHT_GOLD },
      { row: 0, col: 12, color: GOLD },
      { row: 1, col: 7, color: LIGHT_GOLD },
      { row: 1, col: 8, color: LIGHT_GOLD },
      { row: 1, col: 9, color: GOLD },
      { row: 1, col: 10, color: LIGHT_GOLD },
      { row: 1, col: 11, color: LIGHT_GOLD },
    ],
  },
  red_scarf: {
    id: "red_scarf",
    label: "Red scarf",
    description: "A cozy red scarf across the body.",
    cells: [
      { row: 10, col: 3, color: RED },
      { row: 10, col: 4, color: RED },
      { row: 10, col: 5, color: RED },
      { row: 10, col: 6, color: RED },
      { row: 10, col: 7, color: RED },
      { row: 10, col: 8, color: RED },
      { row: 10, col: 9, color: RED },
      { row: 10, col: 10, color: RED },
      { row: 10, col: 11, color: RED },
      { row: 10, col: 12, color: RED },
      { row: 10, col: 13, color: RED },
      { row: 10, col: 14, color: RED },
      { row: 10, col: 15, color: RED },
      { row: 11, col: 3, color: DARK_RED },
      { row: 11, col: 4, color: DARK_RED },
      { row: 11, col: 5, color: DARK_RED },
      { row: 11, col: 6, color: DARK_RED },
      { row: 11, col: 7, color: DARK_RED },
      { row: 11, col: 8, color: DARK_RED },
      { row: 11, col: 9, color: DARK_RED },
      { row: 11, col: 10, color: DARK_RED },
      { row: 11, col: 11, color: RED },
      { row: 11, col: 12, color: RED },
      { row: 11, col: 13, color: DARK_RED },
      { row: 11, col: 14, color: DARK_RED },
      { row: 11, col: 15, color: DARK_RED },
      { row: 12, col: 12, color: DARK_RED },
      { row: 12, col: 13, color: DARK_RED },
      { row: 13, col: 13, color: DARK_RED },
    ],
  },
  star_collar: {
    id: "star_collar",
    label: "Star collar",
    description: "A red collar with a centered star.",
    cells: [
      { row: 11, col: 3, color: RED },
      { row: 11, col: 4, color: RED },
      { row: 11, col: 5, color: RED },
      { row: 11, col: 6, color: RED },
      { row: 11, col: 7, color: RED },
      { row: 11, col: 8, color: RED },
      { row: 11, col: 12, color: RED },
      { row: 11, col: 13, color: RED },
      { row: 11, col: 14, color: RED },
      { row: 11, col: 15, color: RED },
      { row: 10, col: 10, color: GOLD },
      { row: 11, col: 9, color: GOLD },
      { row: 11, col: 10, color: LIGHT_GOLD },
      { row: 11, col: 11, color: GOLD },
      { row: 12, col: 10, color: GOLD },
    ],
  },
  green_bow: {
    id: "green_bow",
    label: "Green bow",
    description: "A green bow for the top of the head.",
    cells: [
      { row: -2, col: 7, color: GREEN },
      { row: -2, col: 8, color: GREEN },
      { row: -2, col: 10, color: GREEN },
      { row: -2, col: 11, color: GREEN },
      { row: -1, col: 7, color: GREEN },
      { row: -1, col: 8, color: LIGHT_GREEN },
      { row: -1, col: 9, color: GREEN },
      { row: -1, col: 10, color: LIGHT_GREEN },
      { row: -1, col: 11, color: GREEN },
      { row: 0, col: 8, color: GREEN },
      { row: 0, col: 9, color: LIGHT_GREEN },
      { row: 0, col: 10, color: GREEN },
      { row: 1, col: 9, color: BROWN },
      { row: 2, col: 9, color: BROWN },
    ],
  },
  pink_side_bow: {
    id: "pink_side_bow",
    label: "Pink side bow",
    description: "A small pink bow beside the left ear.",
    cells: [
      { row: 1, col: 3, color: PINK },
      { row: 1, col: 4, color: LIGHT_PINK },
      { row: 1, col: 6, color: LIGHT_PINK },
      { row: 1, col: 7, color: PINK },
      { row: 2, col: 2, color: PINK },
      { row: 2, col: 3, color: LIGHT_PINK },
      { row: 2, col: 4, color: PINK },
      { row: 2, col: 5, color: PINK },
      { row: 2, col: 6, color: LIGHT_PINK },
      { row: 2, col: 7, color: PINK },
      { row: 2, col: 8, color: PINK },
      { row: 3, col: 3, color: PINK },
      { row: 3, col: 4, color: LIGHT_PINK },
      { row: 3, col: 6, color: LIGHT_PINK },
      { row: 3, col: 7, color: PINK },
    ],
  },
  blue_bow_tie: {
    id: "blue_bow_tie",
    label: "Blue bow tie",
    description: "A blue bow tie for dress-up looks.",
    cells: [
      { row: 10, col: 6, color: DARK_BLUE },
      { row: 10, col: 7, color: BLUE },
      { row: 10, col: 11, color: BLUE },
      { row: 10, col: 12, color: DARK_BLUE },
      { row: 11, col: 5, color: DARK_BLUE },
      { row: 11, col: 6, color: BLUE },
      { row: 11, col: 7, color: BLUE },
      { row: 11, col: 8, color: DARK_BLUE },
      { row: 11, col: 9, color: LIGHT_GOLD },
      { row: 11, col: 10, color: DARK_BLUE },
      { row: 11, col: 11, color: BLUE },
      { row: 11, col: 12, color: BLUE },
      { row: 11, col: 13, color: DARK_BLUE },
      { row: 12, col: 6, color: DARK_BLUE },
      { row: 12, col: 7, color: BLUE },
      { row: 12, col: 11, color: BLUE },
      { row: 12, col: 12, color: DARK_BLUE },
    ],
  },
  cherry_clip: {
    id: "cherry_clip",
    label: "Cherry clip",
    description: "A little cherry hair clip.",
    cells: [
      { row: -2, col: 9, color: LEAF_GREEN },
      { row: -1, col: 8, color: LEAF_GREEN },
      { row: -1, col: 9, color: BROWN },
      { row: -1, col: 10, color: LEAF_GREEN },
      { row: 0, col: 7, color: CHERRY_RED },
      { row: 0, col: 8, color: RED },
      { row: 0, col: 10, color: RED },
      { row: 0, col: 11, color: CHERRY_RED },
      { row: 1, col: 7, color: DARK_RED },
      { row: 1, col: 8, color: CHERRY_RED },
      { row: 1, col: 10, color: CHERRY_RED },
      { row: 1, col: 11, color: DARK_RED },
    ],
  },
};

export const ACCESSORY_PRESET_IDS = Object.keys(
  ACCESSORY_PRESETS,
) as AccessoryPresetId[];

export function getAccessoryPreset(id: AccessoryPresetId): AccessoryPreset {
  return ACCESSORY_PRESETS[id] ?? ACCESSORY_PRESETS.none;
}
