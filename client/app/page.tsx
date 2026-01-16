import NewsletterSubscription from "@/components/NewsletterSubscription";
import Hero from "@/components/pages/home/Hero";
import Latest from "@/components/pages/home/Latest";
import Footer from "@/components/pages/home/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Latest News Section */}
      <Latest />

      {/* Newsletter Subscription Banner */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 dark:from-blue-950 dark:to-indigo-950 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Stay ahead of the curve.
            </h2>
            <p className="text-base md:text-lg text-white/90 dark:text-white/95 mb-8">
              Get the latest AI news and tutorials delivered to your inbox
              weekly. No spam, just signal.
            </p>
            <div className="relative">
              <NewsletterSubscription variant="banner" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
