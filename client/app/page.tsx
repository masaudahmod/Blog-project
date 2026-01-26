import NewsletterSubscription from "@/components/NewsletterSubscription";
import Hero from "@/components/pages/home/Hero";
import Latest from "@/components/pages/home/Latest";
import Footer from "@/components/pages/home/Footer";
import { getSiteContentByPageKey } from "@/lib/action"; // Import CMS fetch helper

const mapContentsBySection = (contents: { section_key: string; content: Record<string, string>; image_url?: string }[] = []) => { // Map content by section key (including image)
  return contents.reduce<Record<string, Record<string, string> & { image_url?: string }>>((acc, item) => { // Reduce content array into object map with image support
    acc[item.section_key] = { ...(item.content || {}), ...(item.image_url ? { image_url: item.image_url } : {}) }; // Store content and image URL by section key
    return acc; // Return accumulator
  }, {}); // End reduce
}; // End mapContentsBySection

export default async function Home() { // Render home page
  const siteContent = await getSiteContentByPageKey("home"); // Fetch CMS content for home
  console.log(siteContent);
  const contentMap = mapContentsBySection(siteContent?.contents || []); // Normalize content by section
  const heroContent = contentMap.hero || {}; // Read hero content
  const newsletterContent = contentMap.newsletter || {}; // Read newsletter content
  const latestContent = contentMap.latest || {}; // Read latest section content
  const digestContent = contentMap.digest || {}; // Read digest content
  const trendingContent = contentMap.trending || {}; // Read trending content
  const adContent = contentMap.ad || {}; // Read ad content
  const footerContent = contentMap.footer || {}; // Read footer content
  const heroOverride = // Build hero override data if present
    heroContent.title || heroContent.subtitle || heroContent.description || heroContent.image_url // Check for CMS hero values (including image)
      ? { // Provide CMS hero object
          id: "cms-hero", // Use a stable id
          image: heroContent.image_url || "/api/placeholder/800/600", // Use CMS image URL or fallback to placeholder
          title: heroContent.title || "The Future of LLMs: Beyond Text Generation", // Use CMS title or fallback
          description: // Provide CMS description or fallback
            heroContent.description || // Use CMS description
            "Exploring the next generation of generative models, reasoning capabilities, and their impact on global industries in 2024.", // Fallback description
          badge: heroContent.subtitle || "FEATURED STORY", // Use CMS subtitle or fallback badge
        } // End CMS hero object
      : undefined; // Keep default Hero data when CMS is empty
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Hero featuredStory={heroOverride} />{/* CMS hero override */}

      {/* Latest News Section */}
      <Latest
        sectionTitle={latestContent.title}
        sectionCtaLabel={latestContent.subtitle || undefined}
        digestTitle={digestContent.title}
        digestDescription={digestContent.description}
        trendingTitle={trendingContent.title}
        adTitle={adContent.title}
        adDescription={adContent.description}
        adCtaLabel={adContent.subtitle || undefined}
      />{/* CMS latest section overrides */}

      {/* Newsletter Subscription Banner */}
      <section className="bg-linear-to-br from-blue-900 to-indigo-900 dark:from-blue-950 dark:to-indigo-950 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              {newsletterContent.title || "Stay ahead of the curve."}
            </h2>{/* CMS newsletter title */}
            <p className="text-base md:text-lg text-white/90 dark:text-white/95 mb-8">
              {newsletterContent.description || "Get the latest AI news and tutorials delivered to your inbox weekly. No spam, just signal."}
            </p>{/* CMS newsletter description */}
            <div className="relative">
              <NewsletterSubscription variant="banner" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        brandName={footerContent.title}
        brandDescription={footerContent.description}
      />{/* CMS footer overrides */}
    </div>
  );
}
