import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arthur Geisweiller | Game Portfolio",
  description: "Portfolio 3D interativo criado com Next.js, React e Three.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
