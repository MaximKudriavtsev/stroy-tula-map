import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Карта строительства Тульской области",
  description:
    "Интерактивный портал строительства Тульской области. Каркас проекта.",
  referrer: "origin-when-cross-origin",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${inter.className} h-full antialiased`}
    >
      <body className="h-full overflow-hidden bg-background font-sans text-on-background">
        {children}
      </body>
    </html>
  );
}
