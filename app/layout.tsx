import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ChunkLoadRecovery from "@/components/ChunkLoadRecovery";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Velib Ride Planner",
  description: "Planifier des balades Velib entre cyclistes",
};

export const viewport: Viewport = {
  themeColor: "#0369a1",
};

const pageBackground = {
  backgroundColor: "#020617",
  backgroundImage:
    "radial-gradient(ellipse 100% 70% at 10% -5%, rgba(56,189,248,0.25), transparent 55%), radial-gradient(ellipse 80% 55% at 95% 10%, rgba(14,165,233,0.2), transparent 50%), linear-gradient(160deg, #020617 0%, #0c1929 30%, #0c4a6e 55%, #0369a1 80%, #082f49 100%)",
  backgroundAttachment: "fixed" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" style={pageBackground}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-sky-50`}
        style={pageBackground}
      >
        <ChunkLoadRecovery />
        {children}
      </body>
    </html>
  );
}
