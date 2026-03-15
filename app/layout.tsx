import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glidefolio | Interactive Digital Portfolio",
  description:
    "Create, present, and share digital brochures and portfolios with a seamless flipbook feel. Designed by Polardot.",
  icons: {
    icon: "/images/favicon.svg",
  },
  openGraph: {
    title: "Glidefolio",
    description: "Interactive Digital Portfolio",
    images: [
      {
        url: "/glidefolio-logo.png",
        width: 1200,
        height: 630,
        alt: "Glidefolio Logo",
      },
    ],
    type: "website",
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
