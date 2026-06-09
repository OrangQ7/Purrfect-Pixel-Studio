import { createHash } from "node:crypto";

import { createEditableAnalysisFromFixedOutput } from "@/lib/editableFixedOutputPlans";
import { isFixedOutputTemplateId } from "@/lib/fixedOutputTemplates";
import {
  type FlexibleCatAnalysis,
  sanitizeFlexibleCatAnalysis,
} from "@/lib/flexibleCatTypes";
import { readUploadedPhotoPayload } from "@/lib/serverUploadedPhoto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 30;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

const FIXED_CLASSIFIER_TIMEOUT_MS = 8_000;
const FLEXIBLE_ANALYSIS_TIMEOUT_MS = 18_000;

type FixedClassifierResponse = {
  analysisMode?: "openai" | "error";
  imageHash?: string;
  templateId?: unknown;
  confidence?: number;
};

type UploadedPhoto = {
  bytes: Buffer;
  mimeType: string;
  sourceName: string;
};

function createPhotoFormData(photo: UploadedPhoto) {
  const formData = new FormData();
  const bytes = new Uint8Array(photo.bytes.byteLength);
  bytes.set(photo.bytes);

  formData.append(
    "photo",
    new Blob([bytes], { type: photo.mimeType }),
    photo.sourceName,
  );
  return formData;
}

function jsonError(error: string, status = 400) {
  return Response.json(
    {
      ok: false,
      error,
    },
    { status, headers: noStoreHeaders },
  );
}

function jsonSuccess(analysis: FlexibleCatAnalysis, message: string) {
  return Response.json(
    {
      ok: true,
      analysis,
      message,
    },
    { headers: noStoreHeaders },
  );
}

async function fetchWithTimeout(
  url: URL,
  init: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function describeRequestError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function tryFixedTemplate(request: Request, photo: UploadedPhoto) {
  const url = new URL("/api/classify-fixed-template", request.url);
  let response: Response;

  try {
    response = await fetchWithTimeout(
      url,
      {
        method: "POST",
        body: createPhotoFormData(photo),
        cache: "no-store",
      },
      FIXED_CLASSIFIER_TIMEOUT_MS,
    );
  } catch (error) {
    console.warn(
      "Fixed-template classification skipped because it timed out or failed.",
      describeRequestError(error),
    );
    return null;
  }

  if (!response.ok) {
    console.warn(
      "Fixed-template classification skipped after non-ok response.",
      response.status,
    );
    return null;
  }

  const data = (await response.json().catch((error) => {
    console.error("Fixed-template classification returned invalid JSON.", error);
    return null;
  })) as FixedClassifierResponse | null;

  if (!data) {
    return null;
  }

  if (!isFixedOutputTemplateId(data.templateId)) {
    return null;
  }

  if (typeof data.confidence === "number" && data.confidence < 0.62) {
    return null;
  }

  return createEditableAnalysisFromFixedOutput(
    data.templateId,
    data.imageHash ?? "matched",
  );
}

function createFallbackFlexiblePlan(photo: UploadedPhoto, reason: string) {
  const imageHash = createHash("sha256")
    .update(photo.bytes)
    .digest("hex")
    .slice(0, 12);

  return sanitizeFlexibleCatAnalysis(
    {
      analysisMode: "mock",
      imageHash,
      modeRecommendation: "flexible_template",
      description: `Local fallback render used because ${reason}.`,
      confidence: 0.35,
    },
    imageHash,
  );
}

async function createFlexiblePlan(request: Request, photo: UploadedPhoto) {
  const url = new URL("/api/analyze-flexible-cat", request.url);
  let response: Response;

  try {
    response = await fetchWithTimeout(
      url,
      {
        method: "POST",
        body: createPhotoFormData(photo),
        cache: "no-store",
      },
      FLEXIBLE_ANALYSIS_TIMEOUT_MS,
    );
  } catch (error) {
    console.error(
      "Flexible analysis request failed or timed out.",
      describeRequestError(error),
    );
    return createFallbackFlexiblePlan(
      photo,
      "the coat analyzer timed out or could not be reached",
    );
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Flexible analysis route returned non-ok.", body);
    return createFallbackFlexiblePlan(
      photo,
      "the coat analyzer was unavailable",
    );
  }

  return sanitizeFlexibleCatAnalysis(body, "flexible");
}

export async function POST(request: Request) {
  let uploadedPhoto: UploadedPhoto | null;

  try {
    uploadedPhoto = await readUploadedPhotoPayload(await request.formData());
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Could not read the uploaded cat photo.",
      400,
    );
  }

  if (!uploadedPhoto) {
    return jsonError("Please choose a cat photo first.", 400);
  }

  try {
    const fixedAnalysis = await tryFixedTemplate(request, uploadedPhoto);

    if (fixedAnalysis) {
      return jsonSuccess(fixedAnalysis, "Pixel kitty is ready.");
    }

    const flexibleAnalysis = await createFlexiblePlan(request, uploadedPhoto);
    return jsonSuccess(flexibleAnalysis, "Pixel kitty is ready.");
  } catch (error) {
    console.error("Pixel cat generation fell back after an unexpected error.", error);
    return jsonSuccess(
      createFallbackFlexiblePlan(
        uploadedPhoto,
        "the generator hit an unexpected error",
      ),
      "Pixel kitty is ready.",
    );
  }
}
