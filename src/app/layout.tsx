import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SynthFocus AI | Autonomous Focus Group Platform",
  description: "Autonomous Multi-Perspective Consumer Focus Group & Product Validation Engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}