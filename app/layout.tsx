import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zhengqi Zhao | VC Due Diligence Dissertation",
  description:
    "A 3-minute dissertation introduction website on machine learning, multi-agent feature engineering, and venture capital due diligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
