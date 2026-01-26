import Hero from "@/components/pages/home/Hero";
import Latest from "@/components/pages/home/Latest";
import NewsletterBanner from "@/components/pages/home/NewsletterBanner";
import Footer from "@/components/pages/home/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Latest />
      <NewsletterBanner />
      <Footer />
    </div>
  );
}
