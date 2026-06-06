import { createHash } from "node:crypto";

import OpenAI from "openai";

import { COAT_PRESETS, PATTERN_SYMMETRIES } from "@/lib/colorRoles";
import { FLEXIBLE_REGION_CLUSTERS, FLEXIBLE_RENDER_REGIONS } from "@/lib/flexibleCatTemplate";
import {
  DEFAULT_FLEXIBLE_ANALYSIS,
  DEFAULT_FUR_REGION_PLAN,
  FEATURE_COLOR_ROLES,
  FUR_COLOR_ROLES,
  MODE_RECOMMENDATIONS,
  type FlexibleCatAnalysis,
  sanitizeFlexibleCatAnalysis,
} from "@/lib/flexibleCatTypes";
import { readUploadedPhotoPayload } from "@/lib/serverUploadedPhoto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

const furRegionPlanProperties = Object.fromEntries(
  FLEXIBLE_RENDER_REGIONS.map((region) => [
    region,
    { type: "string", enum: FUR_COLOR_ROLES },
  ]),
);

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "analysisMode",
    "imageHash",
    "modeRecommendation",
    "coatPreset",
    "symmetry",
    "mainColorRoles",
    "furRegionPlan",
    "featureRegionPlan",
    "description",
    "confidence",
  ],
  properties: {
    analysisMode: { type: "string", enum: ["openai", "mock", "error"] },
    imageHash: { type: "string" },
    modeRecommendation: { type: "string", enum: MODE_RECOMMENDATIONS },
    coatPreset: { type: "string", enum: COAT_PRESETS },
    symmetry: { type: "string", enum: PATTERN_SYMMETRIES },
    mainColorRoles: {
      type: "object",
      additionalProperties: false,
      required: ["primary", "secondary", "accent", "point", "whiteArea", "innerEar"],
      properties: {
        primary: { type: "string", enum: FUR_COLOR_ROLES },
        secondary: { type: "string", enum: FUR_COLOR_ROLES },
        accent: { type: "string", enum: FUR_COLOR_ROLES },
        point: { type: "string", enum: FUR_COLOR_ROLES },
        whiteArea: { type: "string", enum: FUR_COLOR_ROLES },
        innerEar: { type: "string", enum: FUR_COLOR_ROLES },
      },
    },
    furRegionPlan: {
      type: "object",
      additionalProperties: false,
      required: FLEXIBLE_RENDER_REGIONS,
      properties: furRegionPlanProperties,
    },
    featureRegionPlan: {
      type: "object",
      additionalProperties: false,
      required: ["LEYE", "REYE", "NOSE", "MOUTH"],
      properties: {
        LEYE: { type: "string", enum: FEATURE_COLOR_ROLES },
        REYE: { type: "string", enum: FEATURE_COLOR_ROLES },
        NOSE: { type: "string", enum: FEATURE_COLOR_ROLES },
        MOUTH: { type: "string", enum: FEATURE_COLOR_ROLES },
      },
    },
    description: { type: "string" },
    confidence: { type: "number" },
  },
};

const flexibleAnalysisInstructions = [
  "You are a professional cat fur-region planner for a deterministic 21x18 pixel cat renderer.",
  "You must not generate an image. You only assign controlled color roles to fixed template regions.",
  "The fixed silhouette and outline never change. Fur logic and face features are separate layers.",
  "Do not identify or mention cat breed. Describe coat distribution, color blocks, and regional fur patterns only.",
  "Ignore background, lighting, shadows, highlights, camera white balance, compression, accessories, eye sparkle, nose detail, mouth detail, and expression.",
  "Do not return arbitrary HEX colors. Use only the provided fur color role enum and feature color role enum.",
  "For black or near-black fur, assign dark_grey instead. Pure black is reserved for the outline and feature overlays so facial expressions stay visible.",
  "Use at most four or five visible fur color roles. Merge similar colors into one role. No random single-region noise.",
  "Use the region clusters to keep patterns coherent. If one arm is patterned, nearby shoulder/lower-arm/paw regions should usually share the same color family. If muzzle is white, MZ, NZ, and CHIN should usually stay together. Tail TB, TM, and TT should read as a connected pattern.",
  "Symmetric cats should remain mostly symmetric. Calico, tortoiseshell, torbie, patched tabby, cow cats, and orange bicolor may be asymmetric.",
  "Eyes, nose, and mouth are feature overlays only. They should never affect furRegionPlan.",
  `Flexible region clusters: ${JSON.stringify(FLEXIBLE_REGION_CLUSTERS)}.`,
  `Available fur color roles: ${FUR_COLOR_ROLES.join(", ")}.`,
  `Available feature color roles: ${FEATURE_COLOR_ROLES.join(", ")}.`,
  "Return strict JSON only.",
].join("\n");

function imageHash(bytes: Buffer) {
  return createHash("sha256").update(bytes).digest("hex").slice(0, 12);
}

function mockFlexibleAnalysis(hash: string): FlexibleCatAnalysis {
  const orangeBicolor: FlexibleCatAnalysis = {
    ...DEFAULT_FLEXIBLE_ANALYSIS,
    analysisMode: "mock",
    imageHash: hash,
    modeRecommendation: "flexible_template",
    coatPreset: "orange_bicolor",
    symmetry: "mostly_symmetric",
    mainColorRoles: {
      primary: "orange",
      secondary: "white",
      accent: "deep_orange",
      point: "orange",
      whiteArea: "white",
      innerEar: "pink",
    },
    furRegionPlan: {
      ...DEFAULT_FUR_REGION_PLAN,
      LEO: "orange",
      REO: "orange",
      FH: "orange",
      LFT: "orange",
      RFT: "orange",
      LOF: "orange",
      ROF: "orange",
      LIF: "orange",
      RIF: "orange",
      FCL: "white",
      FCR: "white",
      MZ: "white",
      NZ: "white",
      CHIN: "white",
      CH: "white",
      BE: "white",
      LP: "white",
      RP: "white",
      TB: "orange",
      TM: "orange",
      TT: "deep_orange",
    },
    description:
      "Mock flexible plan: orange bicolor with white muzzle, chest, belly, and paws.",
    confidence: 0.58,
  };

  const calico: FlexibleCatAnalysis = {
    ...DEFAULT_FLEXIBLE_ANALYSIS,
    analysisMode: "mock",
    imageHash: hash,
    modeRecommendation: "flexible_template",
    coatPreset: "calico_patch",
    symmetry: "asymmetric",
    mainColorRoles: {
      primary: "white",
      secondary: "orange",
      accent: "taupe",
      point: "dark_brown",
      whiteArea: "white",
      innerEar: "pink",
    },
    furRegionPlan: {
      ...DEFAULT_FUR_REGION_PLAN,
      LEO: "orange",
      LFT: "orange",
      LOF: "orange",
      LIF: "orange",
      LEA: "orange",
      REO: "taupe",
      RFT: "taupe",
      ROF: "taupe",
      RIF: "taupe",
      REA: "taupe",
      FCL: "white",
      FCR: "white",
      MZ: "white",
      NZ: "white",
      CHIN: "white",
      LSH: "orange",
      LFL: "orange",
      LFM: "orange",
      RSH: "taupe",
      RFL: "taupe",
      RFM: "taupe",
      TB: "taupe",
      TM: "orange",
      TT: "taupe",
    },
    description:
      "Mock flexible plan: asymmetric calico with connected orange and taupe patches.",
    confidence: 0.56,
  };

  const point: FlexibleCatAnalysis = {
    ...DEFAULT_FLEXIBLE_ANALYSIS,
    analysisMode: "mock",
    imageHash: hash,
    modeRecommendation: "flexible_template",
    coatPreset: "colorpoint",
    symmetry: "symmetric",
    mainColorRoles: {
      primary: "cream",
      secondary: "warm_white",
      accent: "taupe",
      point: "dark_blue_grey",
      whiteArea: "warm_white",
      innerEar: "pink",
    },
    furRegionPlan: {
      ...DEFAULT_FUR_REGION_PLAN,
      LEO: "dark_blue_grey",
      REO: "dark_blue_grey",
      LFT: "blue_grey",
      RFT: "blue_grey",
      FH: "blue_grey",
      LIF: "blue_grey",
      RIF: "blue_grey",
      FCL: "dark_blue_grey",
      FCR: "dark_blue_grey",
      LOF: "cream",
      ROF: "cream",
      MZ: "cream",
      NZ: "cream",
      CHIN: "cream",
      LP: "dark_blue_grey",
      RP: "dark_blue_grey",
      TB: "dark_blue_grey",
      TM: "dark_blue_grey",
      TT: "dark_blue_grey",
    },
    description:
      "Mock flexible plan: cream colorpoint with connected face, paw, and tail points.",
    confidence: 0.6,
  };

  const variants = [orangeBicolor, calico, point];
  return variants[Number.parseInt(hash.slice(0, 2), 16) % variants.length];
}

export async function POST(request: Request) {
  const formData = await request.formData();
  let uploadedPhoto;

  try {
    uploadedPhoto = await readUploadedPhotoPayload(formData);
  } catch (error) {
    return Response.json(
      {
        analysisMode: "error",
        error:
          error instanceof Error
            ? error.message
            : "Unable to read uploaded cat photo.",
      },
      { status: 400, headers: noStoreHeaders },
    );
  }

  if (!uploadedPhoto) {
    return Response.json(
      {
        analysisMode: "error",
        error: "Expected uploaded cat photo in the `photo` field or a local path in `photoPath`.",
      },
      { status: 400, headers: noStoreHeaders },
    );
  }

  const { bytes, mimeType } = uploadedPhoto;
  const hash = imageHash(bytes);

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(mockFlexibleAnalysis(hash), { headers: noStoreHeaders });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const dataUrl = `data:${mimeType};base64,${bytes.toString("base64")}`;

    const response = await client.responses.create({
      model: process.env.OPENAI_ANALYSIS_MODEL || "gpt-4.1-mini",
      instructions: flexibleAnalysisInstructions,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                `Return analysisMode as "openai" and imageHash as "${hash}". ` +
                "Recommend flexible_template when the cat can be rendered with region-level fur assignments. " +
                "Fill every key in furRegionPlan. Use LEI and REI as pink unless the inner ear is not visible or should be hidden by dark fur. " +
                "For asymmetrical cats, use connected left/right clusters instead of isolated single-region colors. " +
                "For smooth symmetric cats, keep corresponding left and right regions mostly matching. " +
                "For colorpoint cats, keep main body cream/warm_white and assign point colors to connected face/ear/paw/tail regions. " +
                "For bicolor cats, keep MZ/NZ/CHIN/CH/BE/LP/RP together when they are white. " +
                "Features are overlay-only: featureRegionPlan may choose eye/nose/mouth colors, but furRegionPlan must still describe the fur underneath.",
            },
            {
              type: "input_image",
              image_url: dataUrl,
              detail: "high",
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "flexible_cat_region_analysis",
          strict: true,
          schema: analysisSchema,
        },
      },
      temperature: 0.1,
    });

    const parsed = sanitizeFlexibleCatAnalysis(
      JSON.parse(response.output_text),
      hash,
    );

    return Response.json(
      { ...parsed, analysisMode: "openai", imageHash: hash },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    console.error("Flexible cat analysis failed.", error);
    return Response.json(
      {
        analysisMode: "error",
        imageHash: hash,
        error:
          error instanceof Error
            ? error.message
            : "Flexible cat analysis failed.",
      },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
