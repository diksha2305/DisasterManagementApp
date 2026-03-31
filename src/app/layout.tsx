import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400","600","700","900"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "Aura — Disaster Relief Coordination Platform",
  description: "Real-time AI-powered disaster response coordination for victims, volunteers, NGOs, and government authorities.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${poppins.variable}`}>
      <body className="font-sans bg-[#0b1220] text-slate-100 min-h-screen antialiased overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
