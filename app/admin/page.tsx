import type { Metadata } from "next";

import { AdminGallery } from "@/components/AdminGallery";

export const metadata: Metadata = {
  title: "Admin Gallery | Purrfect Pixel Studio",
  description: "Admin view for saved pixel kitty images.",
};

export default function AdminPage() {
  return <AdminGallery />;
}
