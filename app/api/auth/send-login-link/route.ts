import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

function jsonError(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status, headers: noStoreHeaders });
}

function normalizeRedirectPath(value: unknown) {
  return value === "/admin" ? "/admin" : "/pixel-cat";
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonError("Account login is not configured yet.", 503);
  }

  let body: { email?: unknown; redirectPath?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid login request.", 400);
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!email) {
    return jsonError("Add your email first.", 400);
  }

  const redirectPath = normalizeRedirectPath(body.redirectPath);
  const redirectTo = `${new URL(request.url).origin}${redirectPath}`;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    return jsonError(error.message, 400);
  }

  return Response.json(
    { ok: true, redirectTo },
    { headers: noStoreHeaders },
  );
}
