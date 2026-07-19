import './globals.css'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News Agent",
  description: "Personalized AI news digest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
          {children}
      </body>
    </html>
  );
}