import { createHash } from "node:crypto";

import OpenAI from "openai";

import {
  COAT_PRESETS,
  EAR_PATTERNS,
  FACE_PATTERNS,
  PATTERN_SYMMETRIES,
  PAW_PATTERNS,
  TAIL_PATTERNS,
  type AppearanceAnalysis,
  sanitizeAppearanceAnalysis,
} from "@/lib/colorRoles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "analysisMode",
    "imageHash",
    "coatPreset",
    "regionColors",
    "baseColorSemantic",
    "pointColorSemantic",
    "secondaryColorSemantic",
    "accentColorSemantic",
    "patternSymmetry",
    "facePattern",
    "earPattern",
    "tailPattern",
    "pawPattern",
    "breedLikeHint",
    "description",
    "confidence",
  ],
  properties: {
    analysisMode: { type: "string", enum: ["openai", "mock", "error"] },
    imageHash: { type: "string" },
    coatPreset: { type: "string", enum: COAT_PRESETS },
    regionColors: {
      type: "object",
      additionalProperties: false,
      required: ["faceColor", "earColor", "bodyColor", "pawColor", "tailColor"],
      properties: {
        faceColor: { type: "string" },
        earColor: { type: "string" },
        bodyColor: { type: "string" },
        pawColor: { type: "string" },
        tailColor: { type: "string" },
      },
    },
    baseColorSemantic: { type: "string" },
    pointColorSemantic: { type: "string" },
    secondaryColorSemantic: { type: "string" },
    accentColorSemantic: { type: "string" },
    patternSymmetry: { type: "string", enum: PATTERN_SYMMETRIES },
    facePattern: { type: "string", enum: FACE_PATTERNS },
    earPattern: { type: "string", enum: EAR_PATTERNS },
    tailPattern: { type: "string", enum: TAIL_PATTERNS },
    pawPattern: { type: "string", enum: PAW_PATTERNS },
    breedLikeHint: { type: "string" },
    description: { type: "string" },
    confidence: { type: "number" },
  },
};

const analysisInstructions =
  "You are a professional cat coat feature extractor. Observe the uploaded cat photo, but ignore photo angle, lighting, background, shadows, highlights, camera white balance, and the cat's eyes, nose, mouth, whiskers, expression, or accessories. " +
  "Your only task is to extract the cat's core coat color distribution and assign it to five preset body regions: faceColor, earColor, bodyColor, pawColor, and tailColor. " +
  "Use at most five distinct HEX colors across those five region color fields, excluding pure black. " +
  "Do not directly sample raw RGB values from the photo; infer the real-world coat colors semantically and then choose simplified representative HEX colors. " +
  "Merge similar colors into one main block color. For example, dark grey and light grey should become one grey-blue block when they are the same coat family. " +
  "Ignore tiny hairs, noise, shadows, highlights, reflections, compression artifacts, and scattered spots. Keep color blocks continuous and summarized. " +
  "If the cat is solid colored, output the same HEX color for all five region colors. If the cat has white mittens or white belly/chest areas, use #FFFFFF for the relevant white region semantics and pawColor when paws are white. " +
  "Classify by coat preset and fur pattern, not breed. Breed-like hints are optional weak visual hints only. " +
  "Return strict JSON only and never generate an image.";

function imageHash(bytes: Buffer) {
  return createHash("sha256").update(bytes).digest("hex").slice(0, 12);
}

function mockAnalysis(hash: string): AppearanceAnalysis {
  const variants: AppearanceAnalysis[] = [
    {
      analysisMode: "mock",
      imageHash: hash,
      coatPreset: "colorpoint",
      regionColors: {
        faceColor: "#7B8794",
        earColor: "#7B8794",
        bodyColor: "#F2E5C7",
        pawColor: "#7B8794",
        tailColor: "#7B8794",
      },
      baseColorSemantic: "warm cream",
      pointColorSemantic: "soft blue grey",
      secondaryColorSemantic: "none",
      accentColorSemantic: "none",
      patternSymmetry: "mostly_symmetric",
      facePattern: "soft_mask",
      earPattern: "darker_ears",
      tailPattern: "dark_tail",
      pawPattern: "dark_paws",
      breedLikeHint: "point-cat-like",
      description:
        "Mock analysis: warm cream body with soft blue grey point areas.",
      confidence: 0.62,
    },
    {
      analysisMode: "mock",
      imageHash: hash,
      coatPreset: "orange_bicolor",
      regionColors: {
        faceColor: "#FFFFFF",
        earColor: "#E9832F",
        bodyColor: "#E9832F",
        pawColor: "#FFFFFF",
        tailColor: "#E9832F",
      },
      baseColorSemantic: "orange ginger",
      pointColorSemantic: "none",
      secondaryColorSemantic: "white cream",
      accentColorSemantic: "darker orange",
      patternSymmetry: "mostly_symmetric",
      facePattern: "center_white",
      earPattern: "same_as_body",
      tailPattern: "same_as_body",
      pawPattern: "white_paws",
      breedLikeHint: "none",
      description:
        "Mock analysis: orange bicolor layout with white face, chest, belly, and paws.",
      confidence: 0.58,
    },
    {
      analysisMode: "mock",
      imageHash: hash,
      coatPreset: "silver_shaded",
      regionColors: {
        faceColor: "#C4C8C8",
        earColor: "#C4C8C8",
        bodyColor: "#FFFFFF",
        pawColor: "#FFFFFF",
        tailColor: "#C4C8C8",
      },
      baseColorSemantic: "silver white",
      pointColorSemantic: "none",
      secondaryColorSemantic: "cool grey",
      accentColorSemantic: "none",
      patternSymmetry: "symmetric",
      facePattern: "shaded_sides",
      earPattern: "shaded_ears",
      tailPattern: "gradient_tail",
      pawPattern: "same_as_body",
      breedLikeHint: "shaded-cat-like",
      description:
        "Mock analysis: silver shaded coat with grey top, sides, ears, and tail.",
      confidence: 0.55,
    },
  ];
  const index = Number.parseInt(hash.slice(0, 2), 16) % variants.length;
  return variants[index];
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const photo = formData.get("photo");

  if (!(photo instanceof File)) {
    return Response.json(
      {
        analysisMode: "error",
        error: "Expected uploaded cat photo in the `photo` field.",
      },
      { status: 400, headers: noStoreHeaders },
    );
  }

  const bytes = Buffer.from(await photo.arrayBuffer());
  const hash = imageHash(bytes);

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(mockAnalysis(hash), { headers: noStoreHeaders });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const mimeType = photo.type || "image/png";
    const dataUrl = `data:${mimeType};base64,${bytes.toString("base64")}`;

    const response = await client.responses.create({
      model: process.env.OPENAI_ANALYSIS_MODEL || "gpt-4.1-mini",
      instructions: analysisInstructions,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                `Return analysisMode as "openai" and imageHash as "${hash}". ` +
                "Choose exactly one coatPreset. Use breedLikeHint only as a weak optional visual hint, never as the main rule. " +
                "Fill regionColors with exactly five simplified HEX colors for faceColor, earColor, bodyColor, pawColor, and tailColor. Across those five fields, use no more than five distinct colors excluding #000000. " +
                "If the coat is solid, all five regionColors must be the same color. If paws are white mittens, pawColor must be #FFFFFF. " +
                "For colorpoint cats, baseColorSemantic is the body color and pointColorSemantic is the darker mask/ear/paw/tail color. " +
                "For bicolor cats, secondaryColorSemantic is usually the white or cream area. " +
                "For calico, tortoiseshell, torbie, and patched_tabby, use accentColorSemantic for the extra patch color. " +
                "Keep description short and only about coat pattern.",
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
          name: "cat_appearance_analysis",
          strict: true,
          schema: analysisSchema,
        },
      },
      temperature: 0.1,
    });

    const parsed = sanitizeAppearanceAnalysis(JSON.parse(response.output_text));

    return Response.json(
      { ...parsed, analysisMode: "openai", imageHash: hash },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    console.error("Cat appearance analysis failed.", error);
    return Response.json(
      {
        analysisMode: "error",
        imageHash: hash,
        error:
          error instanceof Error
            ? error.message
            : "Cat appearance analysis failed.",
      },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
