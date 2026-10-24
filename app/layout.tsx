import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yisus Contreras | Content Creator · Fashion · Lifestyle · Venezuela",
  description:
    "MediaKit de Yisus Contreras. Contenido real, estilo sin límites y creatividad con identidad. Colaboraciones con marcas en Venezuela y Latinoamérica.",
  keywords: [
    "Yisus Contreras",
    "content creator Venezuela",
    "fashion influencer",
    "UGC creator",
    "lifestyle content",
    "creador de contenido",
  ],
  openGraph: {
    title: "Yisus Contreras | Content Creator",
    description: "Moda · Lifestyle · Storytelling · Venezuela",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary">
        {children}
      </body>
    </html>
  );
}
