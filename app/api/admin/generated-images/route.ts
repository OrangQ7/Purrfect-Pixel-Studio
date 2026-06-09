import {
  GENERATED_IMAGE_BUCKET,
  GENERATED_IMAGE_TABLE,
  getSupabaseAdminClient,
  getAdminEmails,
  isConfiguredAdminEmail,
} from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

type GeneratedImageRow = {
  accessory_preset: string | null;
  analysis: {
    confidence?: number;
    description?: string;
  } | null;
  background_color: string | null;
  created_at: string;
  face_feature_preset: string | null;
  id: string;
  source_photo_name: string | null;
  storage_path: string;
  user_email: string | null;
};

function jsonError(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status, headers: noStoreHeaders });
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  return match?.[1] ?? null;
}

export async function GET(request: Request) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return jsonError("Supabase is not configured.", 503);
  }

  if (getAdminEmails().size === 0) {
    return jsonError("No admin emails are configured.", 403);
  }

  const token = getBearerToken(request);

  if (!token) {
    return jsonError("Please sign in as an admin.", 401);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return jsonError("Your login session expired. Please sign in again.", 401);
  }

  if (!isConfiguredAdminEmail(user.email)) {
    return jsonError("This account is not allowed to view the admin gallery.", 403);
  }

  const { data, error } = await supabase
    .from(GENERATED_IMAGE_TABLE)
    .select(
      "id, created_at, user_email, storage_path, source_photo_name, analysis, accessory_preset, face_feature_preset, background_color",
    )
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<GeneratedImageRow[]>();

  if (error) {
    console.error("Admin generated image query failed.", error);
    return jsonError("Could not load generated images.", 500);
  }

  const images = await Promise.all(
    (data ?? []).map(async (row) => {
      const { data: signedUrlData } = await supabase.storage
        .from(GENERATED_IMAGE_BUCKET)
        .createSignedUrl(row.storage_path, 60 * 60);

      return {
        accessoryPreset: row.accessory_preset,
        backgroundColor: row.background_color,
        confidence: row.analysis?.confidence ?? null,
        createdAt: row.created_at,
        description: row.analysis?.description ?? null,
        faceFeaturePreset: row.face_feature_preset,
        id: row.id,
        imageUrl: signedUrlData?.signedUrl ?? null,
        sourcePhotoName: row.source_photo_name,
        userEmail: row.user_email,
      };
    }),
  );

  return Response.json({ ok: true, images }, { headers: noStoreHeaders });
}
