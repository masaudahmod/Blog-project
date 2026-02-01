import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { getSiteContentByPageKey } from "@/lib/action";

interface SideArticle {
  id: string;
  image: string;
  title: string;
  badge?: string;
}

interface FeaturedStory {
  id: string;
  image: string;
  title: string;
  description: string;
  badge: string;
}

// Default data
const defaultFeaturedStory: FeaturedStory = {
  id: "1",
  image: "/api/placeholder/800/600",
  title: "The Future of LLMs: Beyond Text Generation",
  description:
    "Exploring the next generation of generative models, reasoning capabilities, and their impact on global industries in 2024.",
  badge: "FEATURED STORY",
};

const defaultSideArticles: SideArticle[] = [
  {
    id: "2",
    image: "/api/placeholder/400/300",
    title: "Nvidia's New H200 Chip Specs Revealed",
  },
  {
    id: "3",
    image: "/api/placeholder/400/300",
    title: "OpenAI Developer Day: New API Features",
    badge: "ENTERPRISE",
  },
];

export default async function Hero() {
  // Fetch CMS content for hero section
  const siteContent = await getSiteContentByPageKey("home");
  const heroContent = siteContent?.contents?.find((item: { section_key: string; content?: Record<string, string>; image_url?: string }) => item.section_key === "hero");
  // Build featured story from CMS or use defaults
  const featuredStory: FeaturedStory = (heroContent?.content?.title || heroContent?.content?.subtitle || heroContent?.content?.description || heroContent?.image_url)
    ? {
        id: "cms-hero",
        image: heroContent?.image_url || "/api/placeholder/800/600",
        title: heroContent?.content?.title || defaultFeaturedStory.title,
        description: heroContent?.content?.description || defaultFeaturedStory.description,
        badge: heroContent?.content?.subtitle || defaultFeaturedStory.badge,
      }
    : defaultFeaturedStory;
  // Filter and map side articles from CMS
  const cmsSideArticles = siteContent?.contents
    ?.filter((item: { section_key: string; content?: Record<string, string>; image_url?: string }) => 
      item.section_key?.toLowerCase().replace(/\s+/g, "-") === "side-article"
    )
    ?.map((item: { id: number; content?: Record<string, string>; image_url?: string }, index: number): SideArticle => ({
      id: String(item.id || index),
      image: item.image_url || `/api/placeholder/400/300`,
      title: item.content?.title || `Side Article ${index + 1}`,
      badge: item.content?.badge || item.content?.subtitle,
    })) || [];
  
  const sideArticles = cmsSideArticles.length > 0 ? cmsSideArticles : defaultSideArticles;
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Featured Story */}
        <div className="lg:col-span-2 relative group">
          <Link href={`/`}>
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden backdrop-blur-sm">
              {/* Background Image with Overlay */}
              <Image src={featuredStory.image} alt={featuredStory.title} fill className="object-cover" />
              {/* Gradient Overlay - Black to White (bottom to top) */}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6 md:p-8 lg:p-10 text-white z-10">
                {/* Badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-500 rounded-full">
                    {featuredStory.badge}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight group-hover:translate-x-1 transition-transform">
                  {featuredStory.title}
                </h1>

                {/* Description */}
                <p className="text-sm md:text-base text-white/90 mb-4 max-w-2xl">
                  {featuredStory.description}
                </p>

                {/* Read More */}
                <div className="flex items-center gap-2 text-sm font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Side Articles */}
        <div className="flex flex-col gap-6">
          {sideArticles.map((article: SideArticle, index: number) => (
            <Link
              key={article.id}
              href={`/`}
              className="relative group flex-1"
            >
              <div className="relative h-[190px] md:h-[240px] rounded-xl overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-slate-800 via-slate-700 to-slate-900">
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
                  {/* Pattern overlay for variety
                  {index === 0 && (
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-400/30 rounded-full blur-2xl" />
                    </div>
                  )}
                  {index === 1 && (
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-purple-400/30 rounded-full blur-2xl" />
                    </div>
                  )} */}
                  <Image src={article.image} alt={article.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-4 md:p-5 text-white">
                  {article.badge && (
                    <div className="mb-2">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-blue-500 rounded">
                        {article.badge}
                      </span>
                    </div>
                  )}
                  <h2 className="text-base md:text-lg font-bold leading-tight group-hover:translate-x-1 transition-transform">
                    {article.title}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
