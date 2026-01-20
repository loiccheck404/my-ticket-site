import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "FIFA World Cup 2026 Tickets | Official Booking Platform",
  description: "Book your FIFA World Cup 2026 tickets. Experience the world's biggest football tournament across USA, Canada, and Mexico. Secure your seats now!",
  keywords: ["FIFA World Cup 2026", "World Cup tickets", "football tickets", "soccer tickets", "USA Canada Mexico"],
  openGraph: {
    title: "FIFA World Cup 2026 Tickets",
    description: "Secure your seats for the biggest football tournament in history",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${bebasNeue.variable} antialiased bg-gradient-to-br from-[#0A0A0A] via-[#1A237E] to-[#0A0A0A]`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
