export type FixedTemplateId =
  | "white_cat"
  | "siamese_point"
  | "ragdoll_bicolor"
  | "cow_cat"
  | "blue_golden_shaded"
  | "solid_blue";

export const FIXED_TEMPLATE_LABELS: Record<FixedTemplateId, string> = {
  white_cat: "White cat",
  siamese_point: "Siamese point",
  ragdoll_bicolor: "Ragdoll bicolor",
  cow_cat: "Cow cat",
  blue_golden_shaded: "Blue golden shaded",
  solid_blue: "Blue cat",
};

export const BREED_TO_FIXED_TEMPLATE_HINTS: Record<string, FixedTemplateId[]> = {
  siamese: ["siamese_point"],
  seal_point: ["siamese_point"],
  blue_point: ["siamese_point"],
  ragdoll: ["ragdoll_bicolor"],
  bicolor_ragdoll: ["ragdoll_bicolor"],
  cow_cat: ["cow_cat"],
  tuxedo: ["cow_cat"],
  white_cat: ["white_cat"],
  british_shorthair_blue: ["solid_blue"],
  russian_blue: ["solid_blue"],
  blue_cat: ["solid_blue"],
  blue_golden_shaded: ["blue_golden_shaded"],
  golden_shaded: ["blue_golden_shaded"],
};
