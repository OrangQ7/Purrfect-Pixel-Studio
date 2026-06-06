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

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

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

async function tryFixedTemplate(request: Request, photo: UploadedPhoto) {
  const url = new URL("/api/classify-fixed-template", request.url);
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      body: createPhotoFormData(photo),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Fixed-template classification request failed.", error);
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as FixedClassifierResponse;

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

async function createFlexiblePlan(request: Request, photo: UploadedPhoto) {
  const url = new URL("/api/analyze-flexible-cat", request.url);
  const response = await fetch(url, {
    method: "POST",
    body: createPhotoFormData(photo),
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const error =
      body && typeof body.error === "string"
        ? body.error
        : "Could not analyze the cat coat.";
    throw new Error(error);
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
    return jsonError(
      error instanceof Error
        ? error.message
        : "Could not make the pixel kitty. Please try again.",
      500,
    );
  }
}
