import PixelCatApp from "@/components/PixelCatApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purrfect Pixel Studio",
  description:
    "Upload a cat photo and create a cute fixed-silhouette bead-style pixel cat avatar.",
};

export default function PixelCatPage() {
  return <PixelCatApp />;
}
