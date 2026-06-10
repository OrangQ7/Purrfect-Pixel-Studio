import { randomUUID } from "node:crypto";

import {
  GENERATED_IMAGE_BUCKET,
  GENERATED_IMAGE_TABLE,
  getSupabaseAdminClient,
} from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

function jsonError(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status, headers: noStoreHeaders });
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  return match?.[1] ?? null;
}

function parseJsonField(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return jsonError("Supabase is not configured for saving images.", 503);
  }

  const token = getBearerToken(request);
  let userId: string = randomUUID();
  let userEmail: string | null = null;
  let storageOwner = "anonymous";

  if (token) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.warn("Saving generated image anonymously because auth failed.", userError);
    } else {
      userId = user.id;
      userEmail = user.email ?? null;
      storageOwner = user.id;
    }
  }

  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File) || image.size <= 0) {
    return jsonError("Missing generated pixel cat image.", 400);
  }

  if (image.type && image.type !== "image/png") {
    return jsonError("Only generated PNG images can be saved.", 400);
  }

  const storagePath = `${storageOwner}/${Date.now()}-${randomUUID()}.png`;
  const imageBytes = await image.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(GENERATED_IMAGE_BUCKET)
    .upload(storagePath, imageBytes, {
      contentType: "image/png",
      upsert: false,
    });

  if (uploadError) {
    console.error("Generated image upload failed.", uploadError);
    return jsonError(
      "Could not upload the generated image. Check the Supabase storage bucket.",
      500,
    );
  }

  const { data: record, error: insertError } = await supabase
    .from(GENERATED_IMAGE_TABLE)
    .insert({
      accessory_preset: formData.get("accessoryPreset"),
      analysis: parseJsonField(formData.get("analysis")),
      background_color: formData.get("backgroundColor"),
      face_feature_preset: formData.get("faceFeaturePreset"),
      fur_region_plan: parseJsonField(formData.get("furPlan")),
      source_photo_name: formData.get("sourcePhotoName"),
      storage_path: storagePath,
      user_email: userEmail,
      user_id: userId,
    })
    .select("id, created_at")
    .single();

  if (insertError) {
    console.error("Generated image metadata insert failed.", insertError);
    await supabase.storage.from(GENERATED_IMAGE_BUCKET).remove([storagePath]);
    return jsonError(
      "Could not save the image record. Check the generated_images table.",
      500,
    );
  }

  return Response.json(
    {
      ok: true,
      image: {
        createdAt: record.created_at,
        id: record.id,
      },
    },
    { headers: noStoreHeaders },
  );
}
