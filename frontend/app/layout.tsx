import "./globals.css";
import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WakeUpBanner from "@/components/WakeUpBanner";

export const metadata: Metadata = {
  title: "TechVista | AI-Powered Technology & Company Leadership Intelligence",
  description:
    "Evaluate multinational technology companies and emerging technologies using multi-indicator scoring engines and 10–15 year horizon ML forecasting.",
  openGraph: {
    title: "TechVista — AI Leadership Analytics",
    description: "See the Technology Leaders of Tomorrow with explainable AI forecasting.",
    siteName: "TechVista",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechVista — AI Leadership Intelligence",
    description: "Multidimensional corporate and technology leadership forecasts (2027–2040).",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <WakeUpBanner />
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
