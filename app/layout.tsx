import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "Akrush — AI Farmer Support",
  description: "AI-powered farmer helpline supporting 11 Indian languages",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lexend.variable}`}>
      <body className={`${lexend.className} antialiased bg-[#fbf9f4] text-[#1b1c19]`}>
        {children}
      </body>
    </html>
  );
}
