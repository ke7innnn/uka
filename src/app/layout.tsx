import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Playfair_Display } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Umesh Kekre & Associates | Architect",
  description: "Visionary architect and principal designer at Umesh Kekre & Associates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable} ${playfair.variable} antialiased bg-black text-white`}>
        <LenisProvider>
          <Navbar />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
