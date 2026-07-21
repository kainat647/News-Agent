import './globals.css'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News Agent",
  description: "Personalized News AI Aggregator",
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "News Agent",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}