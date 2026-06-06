import type { FixedOutputTemplateId } from "./fixedOutputTemplates";

type TemplateClassifierProfile = {
  id: FixedOutputTemplateId;
  name: string;
  useWhen: string[];
  rejectWhen: string[];
};

export const FIXED_TEMPLATE_CLASSIFIER_PROFILES: Record<
  FixedOutputTemplateId,
  TemplateClassifierProfile
> = {
  cow_cat_dark: {
    id: "cow_cat_dark",
    name: "dark cow cat / black-white tuxedo-like cow pattern",
    useWhen: [
      "The coat has large continuous black or very dark brown patches with clear white areas.",
      "The center face, chest, belly, paws, or muzzle are white while the head sides, back, or tail are dark.",
      "The dark patches are blocky and high contrast, not soft shading or gradual tipping.",
    ],
    rejectWhen: [
      "The dark color is only a soft face mask, ear edge, tail shadow, or shaded tipping.",
      "The patches are grey rather than black/dark brown; use cow_cat_grey instead.",
      "The cat is mostly cream/gold with blue-grey shading; use blue_golden_shaded instead.",
    ],
  },
  white_cat: {
    id: "white_cat",
    name: "solid white cat",
    useWhen: [
      "The cat is solid white or nearly all white across the visible body.",
      "Small pink ears, pale shadows, or lighting warmth do not change the white-cat classification.",
      "Use this when markings are absent or so faint that the output should read as a white cat.",
    ],
    rejectWhen: [
      "There are clear cream, gold, grey, brown, or blue-grey coat regions that form a pattern.",
      "There are bicolor side face patches or a central white blaze; consider ragdoll_bicolor.",
      "There are large black, grey, or dark cow patches; use a cow-cat template.",
    ],
  },
  cow_cat_grey: {
    id: "cow_cat_grey",
    name: "grey-white cow cat",
    useWhen: [
      "The coat has large continuous grey patches plus strong white areas.",
      "The grey areas are patch-like and high contrast, often on face sides, body, or tail.",
      "The pattern reads as grey-and-white bicolor rather than shaded gold or cream.",
    ],
    rejectWhen: [
      "The cat is solid blue-grey without strong white patches; use solid_blue.",
      "The cat is cream/gold with grey shaded tipping; use blue_golden_shaded.",
      "The dark areas are black or dark brown; use cow_cat_dark.",
    ],
  },
  solid_blue: {
    id: "solid_blue",
    name: "solid blue-grey cat",
    useWhen: [
      "The visible coat is mostly uniform blue-grey, slate, or cool grey.",
      "There are no large white patches, cream body regions, or strong face masks.",
      "Slight darker edges, tail darkness, or lighting shadows can still be solid_blue.",
    ],
    rejectWhen: [
      "The body is warm cream/gold with grey-blue shaded tipping; use blue_golden_shaded.",
      "There are large white patches; use cow_cat_grey or another bicolor template.",
      "The cat has pale body plus clear dark face, paws, ears, and tail points; use siamese_point.",
    ],
  },
  cream_cat: {
    id: "cream_cat",
    name: "plain cream or off-white cat",
    useWhen: [
      "The cat is mostly warm cream, ivory, off-white, or very pale beige.",
      "The coat has no strong bicolor patches, no obvious point mask, and no blue-golden shaded topcoat.",
      "Soft lighting warmth or very faint beige areas should still remain cream_cat.",
      "For a close-up of a mostly white or cream cat with only faint beige, taupe, or grey facial smudges, choose cream_cat instead of siamese_point or unknown.",
    ],
    rejectWhen: [
      "There are clear grey, taupe, or brown side-face patches with a white center blaze; use ragdoll_bicolor.",
      "There is warm gold body plus blue-grey or grey-brown shaded tipping on head, sides, or tail; use blue_golden_shaded.",
      "There is a high-contrast dark face mask with dark ears, paws, and tail; use siamese_point.",
    ],
  },
  blue_golden_shaded: {
    id: "blue_golden_shaded",
    name: "blue golden shaded / golden shaded",
    useWhen: [
      "The coat has a warm cream, ivory, beige, or golden base with soft blue-grey, silver, taupe, or grey-brown shaded tipping.",
      "The cat looks plush or British-Shorthair-like: round face/body, dense short coat, soft shaded head/back/sides/tail.",
      "Darker tail, darker ear edges, grey shaded forehead, or shaded cheeks count as shaded tipping, not Siamese points.",
    ],
    rejectWhen: [
      "There is a sharp white center blaze with brown side patches like a ragdoll bicolor; use ragdoll_bicolor.",
      "The cat is plain cream/off-white with almost no visible shaded tipping; use cream_cat.",
      "Only use siamese_point instead if there is a high-contrast dark mask plus clearly dark paws, ears, and tail.",
    ],
  },
  ragdoll_bicolor: {
    id: "ragdoll_bicolor",
    name: "ragdoll-like bicolor",
    useWhen: [
      "The cat is mostly white or cream with soft grey, taupe, beige, or warm brown patches on the side face, forehead, ears, or tail.",
      "The face has a white center blaze or white central muzzle/forehead with colored side patches.",
      "The overall impression is soft bicolor: pale body, white center/chest, colored side mask patches, not a full dark mask.",
    ],
    rejectWhen: [
      "The entire face center is a strong dark mask with dark ears, paws, and tail; use siamese_point.",
      "The cat is nearly all white with no meaningful side patches; use white_cat.",
      "The coat is short plush warm gold with grey-blue shaded tipping rather than bicolor patches; use blue_golden_shaded.",
    ],
  },
  siamese_point: {
    id: "siamese_point",
    name: "Siamese or true colorpoint",
    useWhen: [
      "Use only for a true high-contrast colorpoint layout: pale body plus obvious dark face mask, dark ears, dark paws, and dark tail.",
      "The darkest color should concentrate on the extremities, especially a central face mask and paws/tail, not just soft cheek shading.",
      "The point areas should be more decisive and mask-like than the gradual shaded tipping seen in blue-golden shaded cats.",
    ],
    rejectWhen: [
      "Do not use for a close-up face alone unless a clear full dark mask is visible; do not infer dark paws or tail from the eyes or face crop.",
      "Do not use when the face has a white center blaze or white muzzle with colored side patches; use ragdoll_bicolor.",
      "Do not use when the cat is cream/gold with soft blue-grey or taupe shaded tipping; use blue_golden_shaded.",
      "Do not use when the cat is mostly plain cream/off-white without strong point contrast; use cream_cat.",
    ],
  },
};

export function buildFixedTemplateClassifierGuide() {
  return Object.values(FIXED_TEMPLATE_CLASSIFIER_PROFILES)
    .map((profile) => {
      const useWhen = profile.useWhen.map((rule) => `use: ${rule}`).join(" ");
      const rejectWhen = profile.rejectWhen
        .map((rule) => `reject: ${rule}`)
        .join(" ");

      return `${profile.id} (${profile.name}). ${useWhen} ${rejectWhen}`;
    })
    .join("\n");
}

export const FIXED_TEMPLATE_BOUNDARY_RULES = [
  "First decide whether the visible pattern is solid, bicolor patches, shaded/tipped, or true colorpoint.",
  "Do not classify from eye color. Blue eyes alone never imply siamese_point.",
  "Do not infer missing paws or tail from a close-up face crop. If the body/extremities are not visible, rely on the visible coat pattern only.",
  "A mostly white, cream, or ivory cat with only faint beige/taupe face smudges should be cream_cat, not siamese_point or unknown.",
  "Soft grey, taupe, or beige cheek shading with a white center face is ragdoll_bicolor, not siamese_point.",
  "Warm cream/gold fur with blue-grey or grey-brown shaded tipping is blue_golden_shaded, not siamese_point.",
  "siamese_point requires a real dark point system: dark face mask, dark ears, dark paws, and dark tail. If these are not all clearly supported, choose another matching template or unknown.",
  "If the match is weak or the cat does not fit one of the eight outputs, return unknown instead of forcing the nearest template.",
].join(" ");
