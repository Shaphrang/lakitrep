import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Ki Trep Resort",
  description: "Admin-first scaffold for La Ki Trep Resort",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
