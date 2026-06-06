export type FaceFeaturePresetId =
  | "none"
  | "blue_classic"
  | "yellow_classic"
  | "green_lively"
  | "odd_eyes"
  | "grey_soft"
  | "black_classic"
  | "bean_eyes"
  | "squint_eyes"
  | "tiny_face";

export type FaceFeatureRole =
  | "left_eye_accent"
  | "left_eye_core"
  | "right_eye_core"
  | "right_eye_accent"
  | "nose"
  | "mouth"
  | "mouth_left"
  | "mouth_right"
  | "blush_left"
  | "blush_right";

export type FaceFeatureCell = {
  row: number;
  col: number;
  role: FaceFeatureRole;
};

export type FaceFeatureOverlayPlacement = {
  row: number;
  col: number;
  width: number;
  height: number;
};

export type FaceFeaturePreset = {
  id: FaceFeaturePresetId;
  label: string;
  description: string;
  imageSrc: string | null;
  placement: FaceFeatureOverlayPlacement;
  cells: FaceFeatureCell[];
};

const FACE_OVERLAY_PLACEMENT: FaceFeatureOverlayPlacement = {
  row: 5,
  col: 6,
  width: 7,
  height: 4,
};

const LOWER_FACE_OVERLAY_PLACEMENT: FaceFeatureOverlayPlacement = {
  ...FACE_OVERLAY_PLACEMENT,
  row: FACE_OVERLAY_PLACEMENT.row + 1,
};

function makePreset(
  id: FaceFeaturePresetId,
  label: string,
  description: string,
  imageSrc: string | null,
  placement: FaceFeatureOverlayPlacement = FACE_OVERLAY_PLACEMENT,
): FaceFeaturePreset {
  return {
    id,
    label,
    description,
    imageSrc,
    placement,
    cells: [],
  };
}

export const FACE_FEATURE_PRESETS: Record<
  FaceFeaturePresetId,
  FaceFeaturePreset
> = {
  none: makePreset("none", "No face", "No face sticker overlay.", null),
  black_classic: makePreset(
    "black_classic",
    "Classic black eyes",
    "Original black-eye sticker with the white grid removed.",
    "/pixel-cat/expressions/black_classic.jpg",
    LOWER_FACE_OVERLAY_PLACEMENT,
  ),
  grey_soft: makePreset(
    "grey_soft",
    "Soft grey eyes",
    "Original grey-eye sticker with the white grid removed.",
    "/pixel-cat/expressions/grey_soft.jpg",
    LOWER_FACE_OVERLAY_PLACEMENT,
  ),
  odd_eyes: makePreset(
    "odd_eyes",
    "Odd eyes",
    "Original odd-eye sticker with the white grid removed.",
    "/pixel-cat/expressions/odd_eyes.jpg",
    LOWER_FACE_OVERLAY_PLACEMENT,
  ),
  green_lively: makePreset(
    "green_lively",
    "Bright green eyes",
    "Original green-eye sticker with the white grid removed.",
    "/pixel-cat/expressions/green_lively.jpg",
    LOWER_FACE_OVERLAY_PLACEMENT,
  ),
  blue_classic: makePreset(
    "blue_classic",
    "Clear blue eyes",
    "Original blue-eye sticker with the white grid removed.",
    "/pixel-cat/expressions/blue_classic.jpg",
    LOWER_FACE_OVERLAY_PLACEMENT,
  ),
  yellow_classic: makePreset(
    "yellow_classic",
    "Golden eyes",
    "Original yellow-eye sticker with the white grid removed.",
    "/pixel-cat/expressions/yellow_classic.jpg",
    LOWER_FACE_OVERLAY_PLACEMENT,
  ),
  squint_eyes: makePreset(
    "squint_eyes",
    "Sleepy eyes",
    "Original sleepy-eye sticker with the white grid removed.",
    "/pixel-cat/expressions/squint_eyes.jpg",
  ),
  bean_eyes: makePreset(
    "bean_eyes",
    "Bean eyes",
    "Original bean-eye sticker with the white grid removed.",
    "/pixel-cat/expressions/bean_eyes.jpg",
    LOWER_FACE_OVERLAY_PLACEMENT,
  ),
  tiny_face: makePreset(
    "tiny_face",
    "Tiny open face",
    "Original tiny open-face sticker with the white grid removed.",
    "/pixel-cat/expressions/tiny_face.jpg",
  ),
};

export const FACE_FEATURE_PRESET_IDS = Object.keys(
  FACE_FEATURE_PRESETS,
) as FaceFeaturePresetId[];

export function getFaceFeaturePreset(
  id: FaceFeaturePresetId,
): FaceFeaturePreset {
  return FACE_FEATURE_PRESETS[id] ?? FACE_FEATURE_PRESETS.none;
}

export function isFaceFeaturePresetId(
  value: unknown,
): value is FaceFeaturePresetId {
  return (
    typeof value === "string" &&
    FACE_FEATURE_PRESET_IDS.includes(value as FaceFeaturePresetId)
  );
}
