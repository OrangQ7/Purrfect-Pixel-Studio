export type TemplatePaintRole =
  | "bg"
  | "outline"
  | "furWhite"
  | "furCream"
  | "furWarmCream"
  | "furBlue"
  | "furBlueDark"
  | "furGolden"
  | "furGoldenLight"
  | "furBrown"
  | "furBrownDark"
  | "furTaupe"
  | "furGrey"
  | "furGreyDark"
  | "earPink"
  | "pawPink"
  | "whiteMark"
  | "tailTipGrey";

export type FixedTemplatePalette = Record<TemplatePaintRole, string>;

export const DEFAULT_FIXED_TEMPLATE_PALETTE: FixedTemplatePalette = {
  bg: "#ffffff",
  outline: "#111111",

  furWhite: "#F7F7F7",
  furCream: "#F3E8D3",
  furWarmCream: "#E4C29A",

  furBlue: "#9AA0C8",
  furBlueDark: "#66657E",

  furGolden: "#DEC39D",
  furGoldenLight: "#F3E8CF",

  furBrown: "#8E5F55",
  furBrownDark: "#593B2B",

  furTaupe: "#A99A88",
  furGrey: "#A5A5A5",
  furGreyDark: "#666666",

  earPink: "#F2C7D2",
  pawPink: "#F4CCD8",

  whiteMark: "#FFFFFF",
  tailTipGrey: "#8F8F95",
};
