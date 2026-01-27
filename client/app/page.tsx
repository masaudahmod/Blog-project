import Hero from "@/components/pages/home/Hero";
import Latest from "@/components/pages/home/Latest";
import NewsletterBanner from "@/components/pages/home/NewsletterBanner";
import Footer from "@/components/pages/home/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Blogs Web | About Everything",
  description:
    "Learn web development, JavaScript, MERN stack, and modern programming with in-depth tutorials, guides, and practical examples.",
  keywords: [
    "web development blog",
    "javascript tutorials",
    "mern stack guide",
    "programming blog",
    "learn coding online",
  ],

  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: "Your Brand Name – Web Development & Programming Tutorials",
    description:
      "Master JavaScript, MERN stack, and modern web development with practical tutorials and deep-dive articles.",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "Your Brand Name",
    type: "website",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-home.jpg`, // 1200x630 image রাখবা
        width: 1200,
        height: 630,
        alt: "Your Brand Name – Programming Blog",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Your Brand Name – Web Development Tutorials",
    description:
      "In-depth JavaScript, MERN stack, and web development tutorials for modern developers.",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}/og-home.jpg`],
  },
};

export default function Home() {
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "My Blogs Web",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    description:
      "Learn web development, JavaScript, MERN stack, and modern programming with in-depth tutorials and guides.",
    publisher: {
      "@type": "Organization",
      name: "My Blogs Web",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }} />
      <Hero />
      <Latest />
      <NewsletterBanner />
      <Footer />
    </div>
  );
}
