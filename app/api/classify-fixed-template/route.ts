import { createHash } from "node:crypto";

import OpenAI from "openai";

import {
  buildFixedTemplateClassifierGuide,
  FIXED_TEMPLATE_BOUNDARY_RULES,
} from "@/lib/fixedTemplateClassifierProfiles";
import {
  FIXED_OUTPUT_TEMPLATE_IDS,
  isFixedOutputTemplateId,
  type FixedOutputTemplateId,
} from "@/lib/fixedOutputTemplates";
import { readUploadedPhotoPayload } from "@/lib/serverUploadedPhoto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

const templateIdEnum = [...FIXED_OUTPUT_TEMPLATE_IDS, "unknown"] as const;

export type FixedTemplateClassification = {
  analysisMode: "openai" | "error";
  imageHash: string;
  templateId: FixedOutputTemplateId | "unknown";
  confidence: number;
  reason: string;
};

const classificationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["analysisMode", "imageHash", "templateId", "confidence", "reason"],
  properties: {
    analysisMode: { type: "string", enum: ["openai", "error"] },
    imageHash: { type: "string" },
    templateId: { type: "string", enum: templateIdEnum },
    confidence: { type: "number" },
    reason: { type: "string" },
  },
};

const classifierInstructions = [
  "You are a cat coat classifier for a fixed-template pixel cat product.",
  "The user uploads a real cat photo. Your only job is to classify the cat into one of the supported fixed output templates, or unknown.",
  "Do not generate an image. Do not identify the cat's breed. Classify by visible coat distribution, color blocks, and pattern boundaries only.",
  "Treat supported template ids as internal product asset ids, not breed labels. The reason must describe coat pattern evidence only and must not tell the user a breed.",
  "Ignore background, camera angle, lighting, exposure, accessories, props, eyes, nose, mouth, and expression. Eye color is not a template signal.",
  "Return strict JSON only.",
  "Supported template profiles:",
  buildFixedTemplateClassifierGuide(),
  "Global boundary rules:",
  FIXED_TEMPLATE_BOUNDARY_RULES,
].join("\n");

function imageHash(bytes: Buffer) {
  return createHash("sha256").update(bytes).digest("hex").slice(0, 12);
}

function pickConfidence(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(1, value))
    : 0;
}

function sanitizeClassification(
  value: unknown,
  hash: string,
): FixedTemplateClassification {
  const source =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const templateId = isFixedOutputTemplateId(source.templateId)
    ? source.templateId
    : "unknown";

  return {
    analysisMode: "openai",
    imageHash: typeof source.imageHash === "string" ? source.imageHash : hash,
    templateId,
    confidence: pickConfidence(source.confidence),
    reason:
      typeof source.reason === "string" && source.reason.trim()
        ? source.reason.trim()
        : "No classification reason returned.",
  };
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
    return Response.json(
      {
        analysisMode: "error",
        imageHash: hash,
        error: "OPENAI_API_KEY is required for fixed-template classification.",
      },
      { status: 500, headers: noStoreHeaders },
    );
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const dataUrl = `data:${mimeType};base64,${bytes.toString("base64")}`;

    const response = await client.responses.create({
      model: process.env.OPENAI_ANALYSIS_MODEL || "gpt-4.1-mini",
      instructions: classifierInstructions,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                `Return analysisMode as "openai" and imageHash as "${hash}". ` +
                "Choose one templateId from the enum. If the cat is not clearly one of the supported outputs, choose unknown. " +
                "Do not choose the closest template when the match is weak. The product should output nothing for unknown cats. " +
                "Use cow_cat_dark for dark black/brown cow-cat markings and cow_cat_grey only when the patches are clearly grey. " +
                "Use cream_cat for plain warm cream/off-white cats and siamese_point only when there are obvious darker point markings. " +
                "A mostly white, ivory, or cream cat with only faint beige/taupe facial smudges should return cream_cat, not unknown and not siamese_point. " +
                "Blue-golden shaded cats, including round cream/gold cats with blue-grey or grey-brown shading on the head, body, or tail, must return blue_golden_shaded. " +
                "Do not classify a blue-golden shaded cat as siamese_point only because the tail, ears, forehead, or side shading is darker. " +
                "Do not classify a blue-eyed white or cream close-up as siamese_point unless a true full dark face mask is visible and the dark extremity pattern is supported. " +
                "If the visible face has a white center blaze or white muzzle with soft beige, grey, or taupe side patches, prefer ragdoll_bicolor over siamese_point.",
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
          name: "fixed_template_classification",
          strict: true,
          schema: classificationSchema,
        },
      },
      temperature: 0,
    });

    const parsed = sanitizeClassification(JSON.parse(response.output_text), hash);

    return Response.json(parsed, { headers: noStoreHeaders });
  } catch (error) {
    console.error("Fixed-template classification failed.", error);
    return Response.json(
      {
        analysisMode: "error",
        imageHash: hash,
        error:
          error instanceof Error
            ? error.message
            : "Fixed-template classification failed.",
      },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
