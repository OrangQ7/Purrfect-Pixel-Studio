export type FixedOutputTemplateId =
  | "cow_cat_dark"
  | "white_cat"
  | "cow_cat_grey"
  | "solid_blue"
  | "cream_cat"
  | "blue_golden_shaded"
  | "ragdoll_bicolor"
  | "siamese_point";

export type FixedOutputTemplate = {
  id: FixedOutputTemplateId;
  label: string;
  src: string;
  description: string;
};

export const FIXED_OUTPUT_TEMPLATE_IDS = [
  "cow_cat_dark",
  "white_cat",
  "cow_cat_grey",
  "solid_blue",
  "cream_cat",
  "blue_golden_shaded",
  "ragdoll_bicolor",
  "siamese_point",
] as const satisfies readonly FixedOutputTemplateId[];

export const FIXED_OUTPUT_TEMPLATES: Record<
  FixedOutputTemplateId,
  FixedOutputTemplate
> = {
  cow_cat_dark: {
    id: "cow_cat_dark",
    label: "Dark cow cat",
    src: "/fixed-templates/cow-cat-dark.jpg",
    description:
      "Large dark coat blocks with white in the face center, chest, belly, and paws. Best for high-contrast black-and-white or dark-brown-and-white cow patterns.",
  },
  white_cat: {
    id: "white_cat",
    label: "White cat",
    src: "/fixed-templates/white-cat.jpg",
    description:
      "All white or nearly all white, keeping only pink inner ears and paw pads. Light shadows should not be treated as markings.",
  },
  cow_cat_grey: {
    id: "cow_cat_grey",
    label: "Grey cow cat",
    src: "/fixed-templates/cow-cat-grey.jpg",
    description:
      "Grey blocks with clear white areas. Best for grey-and-white cow patterns with firm coat boundaries.",
  },
  solid_blue: {
    id: "solid_blue",
    label: "Blue cat",
    src: "/fixed-templates/solid-blue.jpg",
    description:
      "A unified blue-grey or cool-grey coat, with slightly darker edges and tail allowed.",
  },
  cream_cat: {
    id: "cream_cat",
    label: "Cream cat",
    src: "/fixed-templates/cream-cat.jpg",
    description:
      "A mostly ivory, milk-white, or pale cream coat, with only very light beige-grey shading.",
  },
  blue_golden_shaded: {
    id: "blue_golden_shaded",
    label: "Blue golden shaded",
    src: "/fixed-templates/blue-golden-shaded.jpg",
    description:
      "Warm cream or golden base with blue-grey or taupe shading on the head, face sides, body, or tail.",
  },
  ragdoll_bicolor: {
    id: "ragdoll_bicolor",
    label: "Ragdoll bicolor",
    src: "/fixed-templates/ragdoll-bicolor.jpg",
    description:
      "A clear white center blaze, white muzzle, white chest, and white belly with beige, warm brown, or taupe blocks on the face sides, ears, or tail.",
  },
  siamese_point: {
    id: "siamese_point",
    label: "Siamese point",
    src: "/fixed-templates/siamese-point.jpg",
    description:
      "A light body with a complete dark face mask plus visibly darker ears, paws, and tail.",
  },
};

export function isFixedOutputTemplateId(
  value: unknown,
): value is FixedOutputTemplateId {
  return (
    typeof value === "string" &&
    FIXED_OUTPUT_TEMPLATE_IDS.includes(value as FixedOutputTemplateId)
  );
}
