import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import UserSync from "@/components/UserSync";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatPulse | Modern Real-time Chat",
  description: "A premium real-time chat application built with Next.js, Convex, and Clerk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-[#0a0a0b] text-white selection:bg-purple-500/30`}>
        <ConvexClientProvider>
          <UserSync />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
