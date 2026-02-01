import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blogs",
  description: "development blogs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google AdSense */}
        {/* <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        /> */}
        {/* Google AdSense Script */}
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
          }}
        />
        <div
          dangerouslySetInnerHTML={{
            __html: `(adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}",
            enable_page_level_ads: true
          });`,
          }}
        /> */}
        
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
