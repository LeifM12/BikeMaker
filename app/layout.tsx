import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BikeMaker — Build your dream MTB",
  description:
    "Design your enduro or downhill mountain bike from real parts. Compatibility-checked, ready to order.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
