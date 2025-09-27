import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { PhotoProvider } from "../contexts/PhotoContext";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cairo.variable} antialiased`}>
        <PhotoProvider>{children}</PhotoProvider>
      </body>
    </html>
  );
}
