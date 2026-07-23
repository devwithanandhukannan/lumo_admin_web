import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUMO Admin — Safety Control Hub",
  description: "Super Admin Portal · Live Emergency SOS · Provider Verification · Booking Operations",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
