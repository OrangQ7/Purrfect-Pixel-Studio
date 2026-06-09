"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
} from "react";

import {
  FlexibleCatRenderer,
  type FlexibleCatRendererHandle,
} from "@/components/FlexibleCatRenderer";
import { AuthPanel, type AuthSnapshot } from "@/components/AuthPanel";
import { NamePlateStudio } from "@/components/NamePlateStudio";
import {
  ACCESSORY_PRESET_IDS,
  ACCESSORY_PRESETS,
  type AccessoryCell,
  type AccessoryPresetId,
} from "@/lib/accessoryTemplate";
import {
  FACE_FEATURE_PRESET_IDS,
  FACE_FEATURE_PRESETS,
  type FaceFeaturePresetId,
} from "@/lib/faceFeatureTemplate";
import {
  DEFAULT_FEATURE_REGION_PLAN,
  DEFAULT_FLEXIBLE_ANALYSIS,
  DEFAULT_FUR_REGION_PLAN,
  FLEXIBLE_REGION_LABELS,
  FUR_COLOR_ROLES,
  FUR_ROLE_HEX,
  type FlexibleCatAnalysis,
  type FlexibleRenderConfig,
  type FurColorRole,
  type FurRegionPlan,
  type RenderableFlexibleFurRegion,
} from "@/lib/flexibleCatTypes";

type BackgroundColor = "white" | "transparent";

type GenerationResponse =
  | {
      ok: true;
      analysis: FlexibleCatAnalysis;
      message?: string;
    }
  | {
      ok: false;
      error: string;
    };

const disconnectedAuth: AuthSnapshot = {
  accessToken: null,
  email: null,
  isConfigured: false,
  isReady: false,
  userId: null,
};

const PHOTO_TYPES = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
const PANEL_CLASS =
  "pixel-grid-card rounded-[28px] border border-white/70 bg-white/58 p-5 shadow-[0_20px_60px_rgba(70,105,160,0.18)]";

function createClientFallbackAnalysis(photoName: string): FlexibleCatAnalysis {
  const localHash = `local-${Date.now().toString(36)}`;

  return {
    ...DEFAULT_FLEXIBLE_ANALYSIS,
    analysisMode: "mock",
    imageHash: localHash,
    description: photoName
      ? `Local kitty preview for ${photoName}.`
      : "Local kitty preview.",
    confidence: 0.3,
  };
}

type PondFishVariant = "sky" | "peach" | "mint" | "lilac" | "butter";

type PixelFishConfig = {
  className: string;
  scale: number;
  variant: PondFishVariant;
};

const POND_FISH_PALETTES: Record<
  PondFishVariant,
  { fill: string; stroke: string; detail: string }
> = {
  sky: {
    detail: "#8ed1fb",
    fill: "#caedf8",
    stroke: "#8bcdf6",
  },
  peach: {
    detail: "#ffb7a6",
    fill: "#ffe3d6",
    stroke: "#ffb1a2",
  },
  mint: {
    detail: "#91ddc9",
    fill: "#d7f6ed",
    stroke: "#86d9c4",
  },
  lilac: {
    detail: "#b8b5f4",
    fill: "#e4e2ff",
    stroke: "#aba8ed",
  },
  butter: {
    detail: "#f4d973",
    fill: "#fff1b9",
    stroke: "#ebcf61",
  },
};

function playUiSound(kind: "tap" | "start" | "success" = "tap") {
  try {
    if (typeof window === "undefined") {
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const frequency =
      kind === "success" ? 880 : kind === "start" ? 620 : 520;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 1.32,
      now + 0.08,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.14);
    window.setTimeout(() => void context.close(), 220);
  } catch {
    // Audio is decorative; browser audio policy must never block generation.
  }
}

function PondFishSprite({ fish }: { fish: PixelFishConfig }) {
  const palette = POND_FISH_PALETTES[fish.variant];

  return (
    <span
      className={`pond-fish ${fish.className}`}
      style={
        {
          "--fish-scale": fish.scale,
        } as CSSProperties
      }
    >
      <svg
        className="pond-fish-svg"
        viewBox="0 0 132 82"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M16 42C16 22.5 35.5 11 66 11C84 11 98 17 106 27C112 19 124 20 128 30C132 41 130 56 120 62C114 66 109 63 105 56C95 65 80 70 58 70C32 70 16 59 16 42Z"
          fill={palette.fill}
          stroke={palette.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="7"
        />
        <circle cx="35" cy="42" r="4" fill={palette.stroke} />
        <path
          d="M52 22C58 35 58 50 52 63"
          stroke={palette.stroke}
          strokeLinecap="round"
          strokeWidth="5"
        />
        <path
          d="M109 34H119"
          stroke={palette.detail}
          strokeLinecap="round"
          strokeWidth="5"
        />
        <path
          d="M108 47H118"
          stroke={palette.detail}
          strokeLinecap="round"
          strokeWidth="5"
        />
      </svg>
    </span>
  );
}

function PondBackground() {
  const fishSprites: PixelFishConfig[] = [
    {
      className: "fish-a",
      scale: 1.02,
      variant: "sky",
    },
    {
      className: "fish-b",
      scale: 0.88,
      variant: "peach",
    },
    {
      className: "fish-c",
      scale: 0.96,
      variant: "butter",
    },
    {
      className: "fish-d",
      scale: 0.84,
      variant: "mint",
    },
    {
      className: "fish-e",
      scale: 0.92,
      variant: "lilac",
    },
    {
      className: "fish-f",
      scale: 0.78,
      variant: "sky",
    },
    {
      className: "fish-g",
      scale: 0.82,
      variant: "peach",
    },
    {
      className: "fish-h",
      scale: 0.74,
      variant: "mint",
    },
    {
      className: "fish-i",
      scale: 0.86,
      variant: "butter",
    },
    {
      className: "fish-j",
      scale: 0.8,
      variant: "lilac",
    },
    {
      className: "fish-k",
      scale: 0.76,
      variant: "sky",
    },
    {
      className: "fish-l",
      scale: 0.9,
      variant: "peach",
    },
  ];

  return (
    <div className="pond-bg" aria-hidden="true">
      <div className="pond-current pond-current-one" />
      <div className="pond-current pond-current-two" />
      <div className="pond-caustics" />
      <div className="water-ripple water-ripple-one" />
      <div className="water-ripple water-ripple-two" />
      <div className="water-ripple water-ripple-three" />
      <div className="pond-bubbles bubble-a" />
      <div className="pond-bubbles bubble-b" />
      <div className="pond-bubbles bubble-c" />
      <div className="gingham-wave" />
      {fishSprites.map((fish) => (
        <PondFishSprite key={fish.className} fish={fish} />
      ))}
    </div>
  );
}

export default function PixelCatApp() {
  const shellRef = useRef<HTMLElement | null>(null);
  const rendererRef = useRef<FlexibleCatRendererHandle | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedPhotoRef = useRef<File | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const isGeneratingRef = useRef(false);
  const resultStageRef = useRef<HTMLDivElement | null>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FlexibleCatAnalysis | null>(null);
  const [furPlan, setFurPlan] = useState<FurRegionPlan>(DEFAULT_FUR_REGION_PLAN);
  const [selectedFurRegion, setSelectedFurRegion] =
    useState<RenderableFlexibleFurRegion | null>(null);
  const [initialFurPlan, setInitialFurPlan] =
    useState<FurRegionPlan>(DEFAULT_FUR_REGION_PLAN);
  const [backgroundColor, setBackgroundColor] =
    useState<BackgroundColor>("white");
  const [accessoryPreset, setAccessoryPreset] =
    useState<AccessoryPresetId>("none");
  const [faceFeaturePreset, setFaceFeaturePreset] =
    useState<FaceFeaturePresetId>("none");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [studioMode, setStudioMode] = useState<"kitty" | "nameplate">("kitty");
  const [authSnapshot, setAuthSnapshot] =
    useState<AuthSnapshot>(disconnectedAuth);

  const renderConfig = useMemo<FlexibleRenderConfig>(
    () => ({
      accessoryPreset,
      backgroundColor,
      faceMode: faceFeaturePreset === "none" ? "faceless" : "features",
      faceFeaturePreset,
      furRegionPlan: furPlan,
      featureRegionPlan:
        analysis?.featureRegionPlan ?? DEFAULT_FEATURE_REGION_PLAN,
    }),
    [
      accessoryPreset,
      analysis?.featureRegionPlan,
      backgroundColor,
      faceFeaturePreset,
      furPlan,
    ],
  );

  useEffect(
    () => () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
    },
    [previewUrl],
  );

  useEffect(() => {
    let isActive = true;
    let context: { revert: () => void } | null = null;
    const removeListeners: Array<() => void> = [];

    void import("gsap").then(({ gsap }) => {
      if (!isActive || !shellRef.current) {
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const shellElement = shellRef.current;

      if (!shellElement) {
        return;
      }

      context = gsap.context(() => {
        const panels = gsap.utils.toArray<HTMLElement>("[data-gsap='panel']");
        const heroItems = gsap.utils.toArray<HTMLElement>(
          "[data-gsap='hero-item']",
        );
        const stickerButtons =
          gsap.utils.toArray<HTMLElement>("[data-gsap='sticker']");
        const actionButtons = gsap.utils.toArray<HTMLElement>(
          ".cute-primary-button, .cute-save-button",
        );
        const cursor = shellElement.querySelector<HTMLElement>(
          "[data-gsap='pond-cursor']",
        );

        gsap.set([...stickerButtons, ...actionButtons], {
          willChange: "transform",
        });

        if (cursor) {
          gsap.set(cursor, { autoAlpha: 0, scale: 0.72, x: 0, y: 0 });
        }

        if (prefersReducedMotion) {
          gsap.set([...panels, ...heroItems], {
            autoAlpha: 1,
            clearProps: "opacity,visibility,transform",
          });
        } else {
          gsap.fromTo(
            panels,
            {
              autoAlpha: 0,
              rotation: (index) => (index === 1 ? 1.8 : index === 2 ? -2 : 2.4),
              scale: 0.94,
              y: 44,
            },
            {
              autoAlpha: 1,
              clearProps: "opacity,visibility,transform",
              duration: 0.82,
              ease: "back.out(1.55)",
              rotation: 0,
              scale: 1,
              stagger: 0.12,
              y: 0,
            },
          );

          gsap.fromTo(
            heroItems,
            { autoAlpha: 0, y: 12 },
            {
              autoAlpha: 1,
              clearProps: "opacity,visibility,transform",
              delay: 0.18,
              duration: 0.46,
              ease: "power2.out",
              stagger: 0.06,
              y: 0,
            },
          );
        }

        if (prefersReducedMotion) {
          return;
        }

        if (cursor) {
          const moveCursorX = gsap.quickTo(cursor, "x", {
            duration: 0.34,
            ease: "power3",
          });
          const moveCursorY = gsap.quickTo(cursor, "y", {
            duration: 0.34,
            ease: "power3",
          });
          const revealCursor = () => {
            gsap.to(cursor, {
              autoAlpha: 1,
              duration: 0.2,
              overwrite: "auto",
              scale: 1,
            });
          };
          const hideCursor = () => {
            gsap.to(cursor, {
              autoAlpha: 0,
              duration: 0.22,
              overwrite: "auto",
              scale: 0.72,
            });
          };
          const moveCursor = (event: PointerEvent) => {
            moveCursorX(event.clientX);
            moveCursorY(event.clientY);
          };
          const makeRipple = (event: PointerEvent) => {
            const ripple = document.createElement("span");
            ripple.className = "tap-ripple";
            ripple.style.left = `${event.clientX}px`;
            ripple.style.top = `${event.clientY}px`;
            document.body.appendChild(ripple);

            gsap.fromTo(
              ripple,
              { autoAlpha: 0.68, scale: 0.18 },
              {
                autoAlpha: 0,
                duration: 0.62,
                ease: "power2.out",
                onComplete: () => ripple.remove(),
                scale: 2.8,
              },
            );
          };

          shellElement.addEventListener("pointerenter", revealCursor);
          shellElement.addEventListener("pointerleave", hideCursor);
          shellElement.addEventListener("pointermove", moveCursor);
          shellElement.addEventListener("pointerdown", makeRipple);
          removeListeners.push(() => {
            shellElement.removeEventListener("pointerenter", revealCursor);
            shellElement.removeEventListener("pointerleave", hideCursor);
            shellElement.removeEventListener("pointermove", moveCursor);
            shellElement.removeEventListener("pointerdown", makeRipple);
          });
        }

        actionButtons.forEach((button) => {
          const bounce = () => {
            gsap.to(button, {
              duration: 0.22,
              ease: "back.out(2.4)",
              overwrite: "auto",
              scale: 1.035,
              y: -4,
            });
          };
          const press = () => {
            gsap.to(button, {
              duration: 0.12,
              ease: "power2.out",
              overwrite: "auto",
              scale: 0.97,
              y: 2,
            });
          };
          const settle = () => {
            gsap.to(button, {
              duration: 0.2,
              ease: "power2.out",
              overwrite: "auto",
              scale: 1,
              y: 0,
            });
          };

          button.addEventListener("pointerenter", bounce);
          button.addEventListener("pointerdown", press);
          button.addEventListener("pointerup", bounce);
          button.addEventListener("pointerleave", settle);
          button.addEventListener("blur", settle);
          removeListeners.push(() => {
            button.removeEventListener("pointerenter", bounce);
            button.removeEventListener("pointerdown", press);
            button.removeEventListener("pointerup", bounce);
            button.removeEventListener("pointerleave", settle);
            button.removeEventListener("blur", settle);
          });
        });

        stickerButtons.forEach((button, index) => {
          const lift = () => {
            gsap.to(button, {
              duration: 0.18,
              ease: "power2.out",
              overwrite: "auto",
              rotation: index % 2 === 0 ? -1.2 : 1.2,
              scale: 1.035,
              y: -5,
            });
          };

          const settle = () => {
            gsap.to(button, {
              duration: 0.22,
              ease: "power2.out",
              overwrite: "auto",
              rotation: 0,
              scale: 1,
              y: 0,
            });
          };

          button.addEventListener("pointerenter", lift);
          button.addEventListener("pointerleave", settle);
          button.addEventListener("blur", settle);
          removeListeners.push(() => {
            button.removeEventListener("pointerenter", lift);
            button.removeEventListener("pointerleave", settle);
            button.removeEventListener("blur", settle);
          });
        });
      }, shellElement);
    });

    return () => {
      isActive = false;
      removeListeners.forEach((removeListener) => removeListener());
      context?.revert();
    };
  }, []);

  useEffect(() => {
    if (!analysis || !resultStageRef.current) {
      return;
    }

    let isActive = true;
    let context: { revert: () => void } | null = null;

    void import("gsap").then(({ gsap }) => {
      if (!isActive || !shellRef.current || !resultStageRef.current) {
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      context = gsap.context(() => {
        gsap.fromTo(
          resultStageRef.current,
          {
            autoAlpha: prefersReducedMotion ? 1 : 0.25,
            scale: prefersReducedMotion ? 1 : 0.96,
            y: prefersReducedMotion ? 0 : 18,
          },
          {
            autoAlpha: 1,
            duration: prefersReducedMotion ? 0 : 0.62,
            ease: "back.out(1.35)",
            scale: 1,
            y: 0,
          },
        );

        gsap.fromTo(
          "[data-gsap='save-button']",
          {
            autoAlpha: prefersReducedMotion ? 1 : 0,
            scale: prefersReducedMotion ? 1 : 0.92,
            y: prefersReducedMotion ? 0 : 14,
          },
          {
            autoAlpha: 1,
            delay: prefersReducedMotion ? 0 : 0.12,
            duration: prefersReducedMotion ? 0 : 0.46,
            ease: "back.out(1.8)",
            scale: 1,
            y: 0,
          },
        );

        if (!prefersReducedMotion) {
          gsap.fromTo(
            "[data-gsap='save-button']",
            { scale: 1 },
            {
              delay: 0.72,
              duration: 0.28,
              ease: "sine.inOut",
              repeat: 1,
              scale: 1.04,
              yoyo: true,
            },
          );
        }
      }, shellRef);
    });

    return () => {
      isActive = false;
      context?.revert();
    };
  }, [analysis]);

  function setSelectedPhoto(nextPhoto: File | null) {
    selectedPhotoRef.current = nextPhoto;
    setPhoto(nextPhoto);
    setAnalysis(null);
    setSelectedFurRegion(null);
    setError(null);
    setSaveStatus(null);
    setProgress(0);
    setStatus(nextPhoto ? "Photo tucked in" : "");

    setPreviewUrl(null);

    if (!nextPhoto) {
      return;
    }

    try {
      setPreviewUrl(URL.createObjectURL(nextPhoto));
    } catch {
      setError("This photo could not be previewed. Please try another image.");
      setPreviewUrl(null);
    }
  }

  function handlePhotoInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextPhoto = event.currentTarget.files?.[0] ?? null;
    setSelectedPhoto(nextPhoto);
  }

  function handlePhotoDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const droppedPhoto =
      Array.from(event.dataTransfer.files).find((file) =>
        file.type.startsWith("image/"),
      ) ?? null;

    setSelectedPhoto(droppedPhoto);
  }

  function startProgress() {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
    }

    setProgress(12);
    progressTimerRef.current = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 88) {
          return current;
        }

        return Math.min(88, current + Math.max(3, Math.round((90 - current) / 8)));
      });
    }, 450);
  }

  function stopProgress(success: boolean) {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    setProgress(success ? 100 : 0);
  }

  async function generatePixelCat() {
    if (isGeneratingRef.current) {
      return;
    }

    const selectedPhoto =
      selectedPhotoRef.current ?? photo ?? fileInputRef.current?.files?.[0] ?? null;

    if (!selectedPhoto) {
      setError("Please pick a kitty photo first.");
      setStatus("");
      return;
    }

    if (selectedPhoto !== photo) {
      setSelectedPhoto(selectedPhoto);
    }

    isGeneratingRef.current = true;
    playUiSound("start");
    setIsGenerating(true);
    setError(null);
    setSaveStatus(null);
    setAnalysis(null);
    setStatus("Making your tiny kitty");
    startProgress();

    try {
      const formData = new FormData();
      formData.append("photo", selectedPhoto);
      if (previewUrl?.startsWith("data:image/")) {
        formData.append("photoDataUrl", previewUrl);
        formData.append("photoFileName", selectedPhoto.name);
      }

      const response = await fetch("/api/generate-pixel-cat", {
        method: "POST",
        body: formData,
        cache: "no-store",
      });

      const data = (await response.json().catch(() => null)) as
        | GenerationResponse
        | null;

      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.ok === false
            ? data.error
            : "Could not make the pixel kitty. Please try again.",
        );
      }

      setFurPlan(data.analysis.furRegionPlan);
      setInitialFurPlan(data.analysis.furRegionPlan);
      setSelectedFurRegion(null);
      setAnalysis(data.analysis);
      stopProgress(true);
      setStatus("Your tiny kitty is ready");
      playUiSound("success");
    } catch (generationError) {
      console.error("Pixel kitty generation failed.", generationError);

      const fallbackAnalysis = createClientFallbackAnalysis(selectedPhoto.name);
      setFurPlan(fallbackAnalysis.furRegionPlan);
      setInitialFurPlan(fallbackAnalysis.furRegionPlan);
      setSelectedFurRegion(null);
      setAnalysis(fallbackAnalysis);
      setError(null);
      stopProgress(true);
      setStatus("Your tiny kitty is ready");
      playUiSound("success");
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  }

  async function savePixelKitty() {
    if (!rendererRef.current || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);
    let localSaveResult: "downloaded" | "shared" | null = null;

    try {
      const generatedImageBlob = await rendererRef.current.exportPngBlob();
      const saveResult = await rendererRef.current.downloadPng();
      localSaveResult = saveResult;
      let uploadedToGallery = false;

      if (authSnapshot.accessToken && analysis) {
        const formData = new FormData();

        formData.append("image", generatedImageBlob, "my-pixel-kitty.png");
        formData.append("analysis", JSON.stringify(analysis));
        formData.append("furPlan", JSON.stringify(furPlan));
        formData.append("accessoryPreset", accessoryPreset);
        formData.append("faceFeaturePreset", faceFeaturePreset);
        formData.append("backgroundColor", backgroundColor);
        formData.append("sourcePhotoName", photo?.name ?? "");

        const response = await fetch("/api/generated-images", {
          body: formData,
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${authSnapshot.accessToken}`,
          },
          method: "POST",
        });
        const data = (await response.json().catch(() => null)) as
          | { ok: true }
          | { ok: false; error?: string }
          | null;

        if (!response.ok || !data?.ok) {
          throw new Error(
            data?.ok === false && data.error
              ? data.error
              : "Could not save to your gallery.",
          );
        }

        uploadedToGallery = true;
      }

      setSaveStatus(
        uploadedToGallery
          ? saveResult === "shared"
            ? "Save sheet opened, and your kitty is in the gallery."
            : "Downloaded and saved to your gallery."
          : saveResult === "shared"
            ? "Save sheet opened. Sign in to keep it in the gallery."
            : "Download started. Sign in to keep it in the gallery.",
      );
      playUiSound("success");
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Save failed. Please try again.";

      setSaveStatus(
        localSaveResult
          ? `Local save started, but gallery save failed: ${message}`
          : message,
      );
    } finally {
      setIsSaving(false);
    }
  }

  function updateFurRegion(
    region: RenderableFlexibleFurRegion,
    role: FurColorRole,
  ) {
    setFurPlan((current) => ({ ...current, [region]: role }));
  }

  function handleFurRegionSelect(region: RenderableFlexibleFurRegion) {
    playUiSound("tap");
    setSelectedFurRegion(region);
  }

  return (
    <main
      ref={shellRef}
      className="pixel-cat-shell isolate relative min-h-screen overflow-hidden px-4 py-6 text-[#211817] sm:px-6 lg:px-8"
    >
      <PondBackground />
      <div className="pond-cursor" data-gsap="pond-cursor" aria-hidden="true" />
      <div className="pointer-events-auto relative z-40 mx-auto mb-5 flex w-full max-w-7xl justify-center">
        <div className="inline-flex rounded-full border border-white/80 bg-white/62 p-2 shadow-[0_16px_40px_rgba(70,105,160,0.16)] backdrop-blur">
          {[
            ["kitty", "Kitty Maker"],
            ["nameplate", "Name Tag"],
          ].map(([mode, label]) => (
            <button
              key={mode}
              data-testid={`studio-tab-${mode}`}
              className={`rounded-full px-5 py-2 text-sm font-black transition ${
                studioMode === mode
                  ? "bg-[#fff2b8] text-[#211817] shadow-[0_8px_18px_rgba(120,160,200,0.18)]"
                  : "text-[#5f7fa5] hover:bg-white/70"
              }`}
              type="button"
              onClick={() => {
                playUiSound("tap");
                setStudioMode(mode as "kitty" | "nameplate");
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {studioMode === "kitty" ? (
        <div className="pointer-events-auto relative z-20 mx-auto grid w-full max-w-[1180px] gap-5 lg:grid-cols-[minmax(260px,300px)_minmax(360px,1fr)_minmax(320px,380px)]">
        <section className={PANEL_CLASS} data-gsap="panel">
          <p
            className="text-xs font-black uppercase tracking-[0.18em] text-[#5887c6]"
            data-gsap="hero-item"
          >
            Purrfect Pixel Studio
          </p>
          <h1
            className="mt-2 text-3xl font-black leading-tight text-[#171313]"
            data-gsap="hero-item"
          >
            Make a tiny bead kitty
          </h1>
          <p
            className="mt-3 text-sm leading-6 text-[#6f5d57]"
            data-gsap="hero-item"
          >
            Pick a photo and turn your cat into a soft little bead charm.
          </p>

          <AuthPanel
            className="mt-5"
            onAuthChange={setAuthSnapshot}
          />

          <div
            className="mt-6 rounded-[22px] border-2 border-dashed border-[#a9c9ed] bg-[#f8fbff]/86 p-4 text-sm transition hover:-translate-y-0.5 hover:border-[#76a7e6] hover:shadow-[0_14px_30px_rgba(118,167,230,0.18)]"
            data-gsap="hero-item"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handlePhotoDrop}
          >
            <p className="block text-center font-black">
              Drop your kitty photo
            </p>
            <p className="mt-2 text-center text-[#7b716b]">
              JPG, PNG, or WEBP
            </p>
            <input
              ref={fileInputRef}
              id="cat-photo"
              data-testid="cat-photo-input"
              className="sr-only"
              type="file"
              name="photo"
              accept={PHOTO_TYPES}
              aria-label="Pick your kitty photo"
              onClick={(event) => {
                event.currentTarget.value = "";
              }}
              onChange={handlePhotoInputChange}
            />
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#ead7c9] bg-white/90 p-2 shadow-inner">
              <label
                htmlFor="cat-photo"
                data-testid="pick-photo-button"
                className="cursor-pointer rounded-xl bg-[#7ab7e8] px-4 py-2 text-sm font-black text-white shadow-[0_6px_0_rgba(79,128,176,0.2)] transition hover:-translate-y-0.5 hover:bg-[#5ca8e1]"
                onClick={() => playUiSound("tap")}
              >
                Pick photo
              </label>
              <span className="min-w-0 flex-1 truncate text-left text-sm font-bold text-[#7b716b]">
                {photo?.name ?? "No kitty yet"}
              </span>
            </div>
          </div>

          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              data-testid="cat-photo-preview"
              src={previewUrl}
              alt="Cat photo preview"
              className="mt-4 aspect-square w-full rounded-[22px] border-4 border-white object-cover shadow-[0_16px_35px_rgba(80,75,70,0.14)]"
            />
          ) : null}

          <button
            className="cute-primary-button mt-4 w-full px-4 py-3 text-sm font-black text-white disabled:cursor-wait disabled:opacity-60"
            data-gsap="hero-item"
            data-testid="generate-kitty-button"
            type="button"
            disabled={isGenerating}
            onClick={() => void generatePixelCat()}
          >
            {isGenerating ? "Sprinkling bead magic..." : "Make my kitty"}
          </button>

          {isGenerating || progress > 0 ? (
            <div className="mt-4 rounded-[20px] border border-[#f3d8a3] bg-[#fff8dc]/90 p-3">
              <div className="flex items-center justify-between text-xs font-black text-[#8a6420]">
                <span>{isGenerating ? "Tiny bead magic" : "All set"}</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-[#ff9ebc] via-[#ffe46a] to-[#83dfcf] transition-all duration-300 ${
                    isGenerating ? "animate-pulse" : ""
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : null}

          {error || status ? (
            <div
              className={`mt-4 rounded-md border p-3 text-sm ${
                error
                  ? "border-[#ffb4b4] bg-[#fff0f0] text-[#b43a3a]"
                  : "border-[#a7eacb] bg-[#effff7] text-[#0b8756]"
              }`}
            >
              {error ?? status}
            </div>
          ) : null}
        </section>

        <section
          className={`${PANEL_CLASS} flex min-h-[680px] flex-col items-center justify-center`}
          data-gsap="panel"
        >
          {analysis ? (
            <>
              <div
                ref={resultStageRef}
                className="pixel-stage flex w-full flex-1 items-center justify-center rounded-[30px] p-5"
                data-gsap="result-stage"
              >
                <FlexibleCatRenderer
                  ref={rendererRef}
                  config={renderConfig}
                  cellSize={24}
                  exportSize={1024}
                  selectedRegion={selectedFurRegion}
                  onRegionSelect={handleFurRegionSelect}
                />
              </div>
              <button
                className="cute-save-button mt-5 w-full max-w-[504px] px-4 py-3 text-base font-black text-white disabled:cursor-wait disabled:opacity-70"
                data-gsap="save-button"
                type="button"
                disabled={isSaving}
                onClick={() => void savePixelKitty()}
              >
                {isSaving ? "Saving..." : "Save my kitty"}
              </button>
              {saveStatus ? (
                <p className="mt-2 text-sm font-bold text-[#2b8676]">
                  {saveStatus}
                </p>
              ) : null}
            </>
          ) : (
            <div className="max-w-md text-center">
              <div className="preview-bob mx-auto grid h-44 w-44 place-items-center rounded-[28px] border-2 border-dashed border-[#b9d7f5] bg-white/75 text-sm font-black text-[#88a3bd]">
                Kitty preview
              </div>
              <p className="mt-4 text-sm leading-6 text-[#756963]">
                Your bead kitty will swim in here.
              </p>
            </div>
          )}
        </section>

        <RegionalControls
          accessoryPreset={accessoryPreset}
          backgroundColor={backgroundColor}
          faceFeaturePreset={faceFeaturePreset}
          furPlan={furPlan}
          hasAnalysis={Boolean(analysis)}
          selectedFurRegion={selectedFurRegion}
          onAccessoryPresetChange={setAccessoryPreset}
          onBackgroundChange={setBackgroundColor}
          onFaceFeaturePresetChange={setFaceFeaturePreset}
          onFurRegionChange={updateFurRegion}
          onReset={() => setFurPlan(initialFurPlan)}
        />
      </div>
      ) : (
        <div className="pointer-events-auto relative z-20">
          <NamePlateStudio />
        </div>
      )}
    </main>
  );
}

function AccessoryPreview({ cells }: { cells: AccessoryCell[] }) {
  if (!cells.length) {
    return (
      <span className="grid h-14 w-full place-items-center rounded-2xl bg-white">
        <span className="relative h-8 w-8 rounded-full border-2 border-[#d7c8bf]">
          <span className="absolute left-1/2 top-1/2 h-[2px] w-9 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-[#d7c8bf]" />
        </span>
      </span>
    );
  }

  const minRow = Math.min(...cells.map((cell) => cell.row));
  const maxRow = Math.max(...cells.map((cell) => cell.row));
  const minCol = Math.min(...cells.map((cell) => cell.col));
  const maxCol = Math.max(...cells.map((cell) => cell.col));
  const rows = maxRow - minRow + 1;
  const cols = maxCol - minCol + 1;
  const colorByCell = new Map(
    cells.map((cell) => [`${cell.row - minRow},${cell.col - minCol}`, cell.color]),
  );

  return (
    <div
      className="inline-grid max-w-full gap-px rounded-xl border border-white bg-[#d9e9f9] p-1 shadow-inner"
      style={{ gridTemplateColumns: `repeat(${cols}, 5px)` }}
      aria-hidden="true"
    >
      {Array.from({ length: rows * cols }).map((_, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const color = colorByCell.get(`${row},${col}`);

        return (
          <span
            key={`${row}-${col}`}
            className="h-[5px] w-[5px] bg-white"
            style={{ backgroundColor: color ?? "#FFFFFF" }}
          />
        );
      })}
    </div>
  );
}

function RegionalControls({
  accessoryPreset,
  backgroundColor,
  faceFeaturePreset,
  furPlan,
  hasAnalysis,
  selectedFurRegion,
  onAccessoryPresetChange,
  onBackgroundChange,
  onFaceFeaturePresetChange,
  onFurRegionChange,
  onReset,
}: {
  accessoryPreset: AccessoryPresetId;
  backgroundColor: BackgroundColor;
  faceFeaturePreset: FaceFeaturePresetId;
  furPlan: FurRegionPlan;
  hasAnalysis: boolean;
  selectedFurRegion: RenderableFlexibleFurRegion | null;
  onAccessoryPresetChange: (value: AccessoryPresetId) => void;
  onBackgroundChange: (value: BackgroundColor) => void;
  onFaceFeaturePresetChange: (value: FaceFeaturePresetId) => void;
  onFurRegionChange: (
    region: RenderableFlexibleFurRegion,
    role: FurColorRole,
  ) => void;
  onReset: () => void;
}) {
  const selectedRole = selectedFurRegion ? furPlan[selectedFurRegion] : null;

  return (
    <section className={PANEL_CLASS} data-gsap="panel">
      <h2 className="text-xl font-black text-[#171313]">Dress-up Playroom</h2>

      <label className="mt-5 block text-sm font-black text-[#5b4d48]" htmlFor="background">
        Dreamy backdrop
      </label>
      <select
        id="background"
        className="mt-2 w-full rounded-2xl border border-[#ead7c9] bg-white/90 px-3 py-2 text-sm font-bold text-[#4f413d]"
        value={backgroundColor}
        onChange={(event) => {
          playUiSound("tap");
          onBackgroundChange(event.target.value as BackgroundColor);
        }}
      >
        <option value="white">Milk white</option>
        <option value="transparent">Transparent</option>
      </select>

      <div className="mt-5 rounded-[24px] border border-white/80 bg-[#fff7fb]/82 p-4 shadow-inner">
        <h3 className="text-base font-black text-[#171313]">Tiny treasures</h3>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {ACCESSORY_PRESET_IDS.map((presetId) => {
            const preset = ACCESSORY_PRESETS[presetId];

            return (
              <button
                key={preset.id}
                aria-label={preset.label}
                data-gsap="sticker"
                className={`sticker-button grid min-h-20 place-items-center rounded-[20px] border p-2 transition ${
                  accessoryPreset === preset.id
                    ? "is-selected border-[#211817] bg-[#fff2b8]"
                    : "border-white bg-white/86"
                }`}
                type="button"
                onClick={() => {
                  playUiSound("tap");
                  onAccessoryPresetChange(preset.id);
                }}
              >
                <AccessoryPreview cells={preset.cells} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-white/80 bg-[#f1fbff]/82 p-4 shadow-inner">
        <h3 className="text-base font-black text-[#171313]">Kitty faces</h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {FACE_FEATURE_PRESET_IDS.map((presetId) => {
            const preset = FACE_FEATURE_PRESETS[presetId];

            return (
              <button
                key={preset.id}
                aria-label={preset.label}
                data-gsap="sticker"
                className={`sticker-button grid min-h-20 place-items-center rounded-[20px] border p-2 transition ${
                  faceFeaturePreset === preset.id
                    ? "is-selected border-[#211817] bg-[#dff7ff]"
                    : "border-white bg-white/86"
                }`}
                type="button"
                onClick={() => {
                  playUiSound("tap");
                  onFaceFeaturePresetChange(preset.id);
                }}
              >
                {preset.imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preset.imageSrc}
                    alt=""
                    className="h-14 w-full rounded-2xl bg-white object-contain"
                  />
                ) : (
                  <span className="grid h-14 w-full place-items-center rounded-2xl bg-white">
                    <span className="relative h-8 w-8 rounded-full border-2 border-[#c9d7df]">
                      <span className="absolute left-1/2 top-1/2 h-[2px] w-9 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-[#c9d7df]" />
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <button
        className="mt-4 w-full rounded-2xl border border-[#ead7c9] bg-white/72 px-4 py-2 text-sm font-black text-[#6b5a55] transition hover:-translate-y-0.5 hover:border-[#f0adc1] disabled:cursor-not-allowed disabled:text-[#c8b9b2]"
        type="button"
        disabled={!hasAnalysis}
        onClick={() => {
          playUiSound("tap");
          onReset();
        }}
      >
        Reset tiny fur
      </button>

      <div
        className="mt-4 rounded-[22px] border border-white/80 bg-white/64 p-4"
        data-testid="fur-paintbox"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-[#171313]">
              Fur paintbox
            </h3>
            <p
              className="mt-1 text-xs font-bold leading-5 text-[#7b716b]"
              data-testid="selected-fur-region"
            >
              {!hasAnalysis
                ? "Make a kitty first."
                : selectedFurRegion
                  ? `Selected: ${FLEXIBLE_REGION_LABELS[selectedFurRegion]}`
                  : "Tap a fur block on the kitty."}
            </p>
          </div>
          <span
            className="h-8 w-8 shrink-0 rounded-xl border-2 border-white shadow-[0_6px_14px_rgba(70,105,160,0.18)]"
            style={{
              background:
                selectedRole && FUR_ROLE_HEX[selectedRole] !== "transparent"
                  ? FUR_ROLE_HEX[selectedRole]
                  : "linear-gradient(135deg, #ffffff 0 45%, #e5d6cf 45% 55%, #ffffff 55%)",
            }}
            aria-hidden="true"
          />
        </div>
        <div className="mt-4 grid grid-cols-6 gap-2">
          {FUR_COLOR_ROLES.map((role, index) => {
            const isTransparent = FUR_ROLE_HEX[role] === "transparent";
            const isSelected = selectedRole === role;

            return (
              <button
                key={role}
                aria-label={`Fur color ${index + 1}`}
                className={`h-10 rounded-2xl border-2 shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 ${
                  isSelected
                    ? "border-[#211817] ring-4 ring-[#fff2b8]"
                    : "border-white"
                }`}
                data-testid={`fur-swatch-${role}`}
                type="button"
                disabled={!hasAnalysis || !selectedFurRegion}
                onClick={() => {
                  if (!selectedFurRegion) {
                    return;
                  }

                  playUiSound("tap");
                  onFurRegionChange(selectedFurRegion, role);
                }}
                style={{
                  background: isTransparent
                    ? "linear-gradient(135deg, #ffffff 0 44%, #d8c7bf 44% 56%, #ffffff 56%)"
                    : FUR_ROLE_HEX[role],
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
