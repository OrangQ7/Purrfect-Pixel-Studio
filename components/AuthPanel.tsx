"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";

import {
  createBrowserSupabaseClient,
  hasSupabaseBrowserConfig,
} from "@/lib/supabaseClient";

export type AuthSnapshot = {
  accessToken: string | null;
  email: string | null;
  isConfigured: boolean;
  isReady: boolean;
  userId: string | null;
};

type AuthPanelProps = {
  className?: string;
  compact?: boolean;
  onAuthChange?: (auth: AuthSnapshot) => void;
};

const disconnectedAuth: AuthSnapshot = {
  accessToken: null,
  email: null,
  isConfigured: false,
  isReady: true,
  userId: null,
};

function snapshotFromSession(session: Session | null): AuthSnapshot {
  return {
    accessToken: session?.access_token ?? null,
    email: session?.user.email ?? null,
    isConfigured: true,
    isReady: true,
    userId: session?.user.id ?? null,
  };
}

export function AuthPanel({
  className = "",
  compact = false,
  onAuthChange,
}: AuthPanelProps) {
  const [auth, setAuth] = useState<AuthSnapshot>(() => {
    const isConfigured = hasSupabaseBrowserConfig();

    return isConfigured
      ? {
          ...disconnectedAuth,
          isConfigured: true,
          isReady: false,
        }
      : disconnectedAuth;
  });
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      queueMicrotask(() => onAuthChange?.(disconnectedAuth));
      return undefined;
    }

    let isActive = true;
    const publish = (nextAuth: AuthSnapshot) => {
      if (!isActive) {
        return;
      }

      setAuth(nextAuth);
      onAuthChange?.(nextAuth);
    };

    void supabase.auth.getSession().then(({ data }) => {
      publish(snapshotFromSession(data.session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      publish(snapshotFromSession(session));
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [onAuthChange]);

  async function sendLoginLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage("Add your email first.");
      return;
    }

    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      setMessage("Accounts are not connected yet.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/pixel-cat`,
      },
    });

    setIsSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Magic link sent. Check your inbox.");
  }

  async function signOut() {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setMessage("Signed out.");
  }

  if (!auth.isConfigured) {
    return (
      <div
        className={`rounded-[18px] border border-[#ead7c9] bg-white/72 p-3 text-xs font-bold leading-5 text-[#7b716b] ${className}`}
      >
        Account system is not connected yet.
      </div>
    );
  }

  if (auth.email) {
    return (
      <div
        className={`rounded-[18px] border border-white/80 bg-white/72 p-3 ${className}`}
      >
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#5887c6]">
          Signed in
        </p>
        <p className="mt-1 truncate text-sm font-black text-[#211817]">
          {auth.email}
        </p>
        <button
          className="mt-3 rounded-full border border-[#ead7c9] bg-white/80 px-3 py-1.5 text-xs font-black text-[#6b5a55] transition hover:-translate-y-0.5"
          type="button"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <form
      className={`rounded-[18px] border border-white/80 bg-white/72 p-3 ${className}`}
      onSubmit={sendLoginLink}
    >
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#5887c6]">
        Account
      </p>
      {!compact ? (
        <p className="mt-1 text-xs font-bold leading-5 text-[#7b716b]">
          Sign in to save your kitty in the studio gallery.
        </p>
      ) : null}
      <input
        className="mt-3 w-full rounded-2xl border border-[#ead7c9] bg-white/90 px-3 py-2 text-sm font-bold text-[#4f413d]"
        type="email"
        value={email}
        placeholder="your@email.com"
        onChange={(event) => setEmail(event.target.value)}
      />
      <button
        className="mt-2 w-full rounded-full bg-[#7ab7e8] px-3 py-2 text-sm font-black text-white shadow-[0_6px_0_rgba(79,128,176,0.18)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Email me a login link"}
      </button>
      {message ? (
        <p className="mt-2 text-xs font-bold leading-5 text-[#2b8676]">
          {message}
        </p>
      ) : null}
    </form>
  );
}
