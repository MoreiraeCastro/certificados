import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { withBasePath } from "@/lib/utils/base-path";
import "./globals.css";

// Mesma fonte do portal, auto-hospedada no build (nada é carregado de domínio externo).
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Certificados Digitais",
  description: "Gestão de certificados digitais e empresas do escritório.",
  icons: {
    // Metadata icon URLs aren't rewritten for basePath automatically (same
    // as next/image's src, per Next's own docs) -- has to be explicit.
    icon: [{ url: withBasePath("/favicon-64.png"), sizes: "64x64", type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
