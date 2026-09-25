import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

// Tipografías del design system V5 (app): títulos en Inter Tight y lecturas de
// "instrumento" (KPIs, porcentajes, fechas) en JetBrains Mono.
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-inter-tight" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-jetbrains-mono" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexo",
  description: "Plataforma Nexo — SG-SST, Calidad y Sostenibilidad",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, interTight.variable, jetbrainsMono.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
