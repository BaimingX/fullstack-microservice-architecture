import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";  // 引入全局导航栏
import Footer from "@/components/Footer"; 
import { AuthProvider } from "@/lib/auth/AuthProvider";
import Script from "next/script";
import { CartProvider } from '@/context/CartContext';

const inter = Inter({ subsets: ["latin"] });

// 增强的元数据配置
export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL || 'https://auscoolstuff.com.au'),
  title: {
    default: "CoolStuff - Trending & Quirky Gadgets You've Never Seen",
    template: "%s | AusCoolStuff"
  },
  description: "Discover viral TikTok gadgets, creative gifts, and weirdly cool products you didn't know you needed. Updated daily with the latest trending finds from around the world.",
  keywords: ["cool gadgets", "TikTok products", "trending items", "quirky gifts", "novelty products", "Australia", "cool stuff"],
  authors: [{ name: "AusCoolStuff" }],
  category: "E-commerce",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "/",
    siteName: "AusCoolStuff",
    title: "CoolStuff - Trending & Quirky Gadgets You've Never Seen",
    description: "Discover viral TikTok gadgets, creative gifts, and weirdly cool products you didn't know you needed.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AusCoolStuff - Trending Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CoolStuff - Trending & Quirky Gadgets",
    description: "Discover viral TikTok gadgets and creative gifts.",
    images: ["/images/twitter-image.jpg"],
  },
  verification: {
    google: "验证码",  // 替换为您的 Google Search Console 验证码
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <AuthProvider>
            <Navbar />   {/* 全局导航栏 */}
            <main className="min-h-screen">{children}</main>  {/* 页面内容 */}
            <Footer />   {/* 全局页脚 */}
          </AuthProvider>
        </CartProvider>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyBDsFTUULatq2jIOsOZ0VXeyJRoLJ6v_x4&libraries=places`}
          strategy="afterInteractive"
        />
        {/* 结构化数据 */}
        <Script id="schema-org" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "AusCoolStuff",
              "url": "${process.env.BASE_URL || 'https://auscoolstuff.com.au'}",
              "logo": "${process.env.BASE_URL || 'https://auscoolstuff.com.au'}/images/logo.png",
              "sameAs": [
                "https://www.facebook.com/auscoolstuff",
                "https://www.instagram.com/auscoolstuff",
                "https://twitter.com/auscoolstuff"
              ]
            }
          `}
        </Script>
      </body>
    </html>
  );
}
