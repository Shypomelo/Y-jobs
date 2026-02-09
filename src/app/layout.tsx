import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReportProvider } from "./providers";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "YJOB",
  description: "維修通報系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="light">
      <head>
        {/* Load Material Symbols for exact icon matching */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.className} antialiased min-h-screen bg-background-light dark:bg-background-dark text-stone-900 dark:text-white overflow-x-hidden selection:bg-primary/30 selection:text-primary pb-20`}
      >
        {/* Global Header removed to allow absolute positioning in Home Page as per design */}

        <main className="w-full">
          <ReportProvider>
            {children}
          </ReportProvider>
        </main>
      </body>
    </html>
  );
}
