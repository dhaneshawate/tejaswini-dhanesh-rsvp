import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tejaswini & Dhanesh — Wedding Celebration",
  description: "Two days, one beautiful beginning. Join Tejaswini and Dhanesh in Pune on 10–11 February 2027.",
  openGraph: {
    title: "Tejaswini & Dhanesh — Wedding Celebration",
    description: "Please join us as we celebrate our wedding in Pune.",
    images: ["/images/couple-hero.jpg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
