import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Chatbot from "@/components/Chatbot";
import { ClerkProvider } from "@clerk/nextjs";
import SiteHeader from "@/components/SiteHeader";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Chicago Housing Intelligence",
  description: "AI-powered rental search and analysis for Chicago.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground`}
        >
          <SiteHeader />
          <main className="flex-1 overflow-hidden relative w-full h-full">
            {children}
          </main>
          <Chatbot />
        </body>
      </html>
    </ClerkProvider>
  );
}
