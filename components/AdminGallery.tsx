"use client";

import { useCallback, useEffect, useState } from "react";

import { AuthPanel, type AuthSnapshot } from "@/components/AuthPanel";

type AdminImage = {
  accessoryPreset: string | null;
  backgroundColor: string | null;
  confidence: number | null;
  createdAt: string;
  description: string | null;
  faceFeaturePreset: string | null;
  id: string;
  imageUrl: string | null;
  sourcePhotoName: string | null;
  userEmail: string | null;
};

type AdminGalleryResponse =
  | {
      ok: true;
      images: AdminImage[];
    }
  | {
      ok: false;
      error: string;
    };

const initialAuth: AuthSnapshot = {
  accessToken: null,
  email: null,
  isConfigured: false,
  isReady: false,
  userId: null,
};

export function AdminGallery() {
  const [auth, setAuth] = useState<AuthSnapshot>(initialAuth);
  const [images, setImages] = useState<AdminImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadImages = useCallback(async () => {
    if (!auth.accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/generated-images", {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
      const data = (await response.json().catch(() => null)) as
        | AdminGalleryResponse
        | null;

      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.ok === false ? data.error : "Could not load generated images.",
        );
      }

      setImages(data.images);
    } catch (loadError) {
      setImages([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load generated images.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [auth.accessToken]);

  useEffect(() => {
    if (auth.accessToken) {
      queueMicrotask(() => {
        void loadImages();
      });
    }
  }, [auth.accessToken, loadImages]);

  return (
    <main className="min-h-screen bg-[#eff8ff] px-4 py-8 text-[#211817]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 rounded-[28px] border border-white bg-white/76 p-5 shadow-[0_18px_50px_rgba(70,105,160,0.16)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5887c6]">
              Purrfect Pixel Studio
            </p>
            <h1 className="mt-2 text-3xl font-black">Admin gallery</h1>
            <p className="mt-2 text-sm font-bold text-[#6f5d57]">
              View saved customer pixel kitties.
            </p>
          </div>
          <AuthPanel compact onAuthChange={setAuth} className="md:w-80" />
        </div>

        <div className="mt-5 flex items-center justify-between rounded-[22px] border border-white bg-white/70 p-4">
          <p className="text-sm font-black text-[#5b4d48]">
            {images.length} saved kitties
          </p>
          <button
            className="rounded-full bg-[#7ab7e8] px-4 py-2 text-sm font-black text-white shadow-[0_6px_0_rgba(79,128,176,0.18)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
            type="button"
            disabled={!auth.accessToken || isLoading}
            onClick={() => void loadImages()}
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error ? (
          <div className="mt-5 rounded-[18px] border border-[#ffb4b4] bg-[#fff0f0] p-4 text-sm font-bold text-[#b43a3a]">
            {error}
          </div>
        ) : null}

        {!auth.accessToken ? (
          <div className="mt-5 rounded-[24px] border border-dashed border-[#a9c9ed] bg-white/70 p-8 text-center text-sm font-bold text-[#7b716b]">
            Sign in with an admin email to open the gallery.
          </div>
        ) : null}

        {auth.accessToken && !isLoading && images.length === 0 && !error ? (
          <div className="mt-5 rounded-[24px] border border-dashed border-[#a9c9ed] bg-white/70 p-8 text-center text-sm font-bold text-[#7b716b]">
            No saved kitties yet.
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <article
              key={image.id}
              className="overflow-hidden rounded-[26px] border border-white bg-white/78 p-4 shadow-[0_16px_42px_rgba(70,105,160,0.14)]"
            >
              {image.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.imageUrl}
                  alt="Saved pixel kitty"
                  className="aspect-square w-full rounded-[20px] bg-white object-contain [image-rendering:pixelated]"
                />
              ) : (
                <div className="grid aspect-square place-items-center rounded-[20px] bg-[#f5fbff] text-sm font-bold text-[#88a3bd]">
                  Missing image
                </div>
              )}
              <div className="mt-4 space-y-1 text-sm">
                <p className="font-black text-[#211817]">
                  {image.userEmail ?? "Unknown user"}
                </p>
                <p className="text-xs font-bold text-[#7b716b]">
                  {new Date(image.createdAt).toLocaleString()}
                </p>
                {image.description ? (
                  <p className="pt-2 text-xs font-bold leading-5 text-[#6f5d57]">
                    {image.description}
                  </p>
                ) : null}
                <p className="pt-2 text-xs font-bold text-[#7b716b]">
                  Face: {image.faceFeaturePreset ?? "none"} | Treasure:{" "}
                  {image.accessoryPreset ?? "none"}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
