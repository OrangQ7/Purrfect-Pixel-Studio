import type {
  FaceFeaturePresetId,
  FaceFeatureRole,
} from "./faceFeatureTemplate";

export type FaceFeaturePalette = Record<FaceFeatureRole, string | null>;

const emptyPalette: FaceFeaturePalette = {
  left_eye_accent: null,
  left_eye_core: null,
  right_eye_core: null,
  right_eye_accent: null,
  nose: null,
  mouth: null,
  mouth_left: null,
  mouth_right: null,
  blush_left: null,
  blush_right: null,
};

export const FACE_FEATURE_PALETTES: Record<
  FaceFeaturePresetId,
  FaceFeaturePalette
> = {
  none: emptyPalette,

  blue_classic: {
    ...emptyPalette,
    left_eye_accent: "#67CBEF",
    left_eye_core: "#1D1416",
    right_eye_core: "#1D1416",
    right_eye_accent: "#67CBEF",
    nose: "#1D1416",
    mouth: "#1D1416",
  },

  yellow_classic: {
    ...emptyPalette,
    left_eye_accent: "#E7E26E",
    left_eye_core: "#1D1416",
    right_eye_core: "#1D1416",
    right_eye_accent: "#E7E26E",
    nose: "#1D1416",
    mouth: "#1D1416",
  },

  green_lively: {
    ...emptyPalette,
    left_eye_accent: "#B8E986",
    left_eye_core: "#2B1027",
    right_eye_core: "#2B1027",
    right_eye_accent: "#B8E986",
    nose: "#2B1027",
    mouth: "#2B1027",
  },

  odd_eyes: {
    ...emptyPalette,
    left_eye_accent: "#E7E26E",
    left_eye_core: "#2B1027",
    right_eye_core: "#2B1027",
    right_eye_accent: "#67CBEF",
    nose: "#2B1027",
    mouth: "#2B1027",
  },

  grey_soft: {
    ...emptyPalette,
    left_eye_accent: "#9DA5A3",
    left_eye_core: "#1D1416",
    right_eye_core: "#1D1416",
    right_eye_accent: "#9DA5A3",
    nose: "#1D1416",
    mouth: "#1D1416",
  },

  black_classic: {
    ...emptyPalette,
    left_eye_core: "#1D1416",
    right_eye_core: "#1D1416",
    nose: "#1D1416",
    mouth: "#1D1416",
  },

  bean_eyes: {
    ...emptyPalette,
    left_eye_core: "#1D1416",
    right_eye_core: "#1D1416",
    nose: "#1D1416",
  },

  squint_eyes: {
    ...emptyPalette,
    left_eye_core: "#1D1416",
    right_eye_core: "#1D1416",
    nose: "#1D1416",
    mouth: "#1D1416",
  },

  tiny_face: {
    ...emptyPalette,
    left_eye_core: "#1D1416",
    right_eye_core: "#1D1416",
    nose: "#1D1416",
    mouth: "#1D1416",
  },
};

export function getFaceFeatureColor(
  presetId: FaceFeaturePresetId,
  role: FaceFeatureRole,
) {
  const palette = FACE_FEATURE_PALETTES[presetId] ?? FACE_FEATURE_PALETTES.none;

  if (role === "mouth_left" || role === "mouth_right") {
    return palette[role] ?? palette.mouth;
  }

  return palette[role];
}
