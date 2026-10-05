import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Messenger AI Auto-Chat",
  description: "Minimal Messenger AI Auto-Chat Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
