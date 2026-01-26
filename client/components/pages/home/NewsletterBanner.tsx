import NewsletterSubscription from "@/components/NewsletterSubscription";
import { getSiteContentByPageKey } from "@/lib/action";

export default async function NewsletterBanner() {
  // Fetch CMS content for newsletter section
  const siteContent = await getSiteContentByPageKey("home");
  const newsletterContent = siteContent?.contents?.find((item: { section_key: string; content?: Record<string, string> }) => item.section_key === "newsletter");
  
  const title = newsletterContent?.content?.title || "Stay ahead of the curve.";
  const description = newsletterContent?.content?.description || "Get the latest AI news and tutorials delivered to your inbox weekly. No spam, just signal.";

  return (
    <section className="bg-linear-to-br from-blue-900 to-indigo-900 dark:from-blue-950 dark:to-indigo-950 py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-base md:text-lg text-white/90 dark:text-white/95 mb-8">
            {description}
          </p>
          <div className="relative">
            <NewsletterSubscription variant="banner" />
          </div>
        </div>
      </div>
    </section>
  );
}
