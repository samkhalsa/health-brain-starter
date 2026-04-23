import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health Brain",
  description: "Personal longevity dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-fg min-h-screen overflow-x-hidden">{children}</body>
    </html>
  );
}
