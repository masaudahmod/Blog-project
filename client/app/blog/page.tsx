import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getAllPosts, getPinnedPosts, getSiteContentByPageKey } from "@/lib/action"; // Import CMS helper
import { PostType } from "@/types";
import Pagination from "@/components/Pagination";
import NewsletterSubscribeButton from "@/components/NewsletterSubscribeButton";
import { PostCard } from "@/components/pages/blog/PostCard";

const heroAuthor = {
  name: "Masaud Ahmod",
  avatar:
    "https://i.ibb.co.com/4ZMqPQ2/me.png",
};

const categories = [
  "Artificial Intelligence",
  "Machine Learning",
  "Edge AI",
  "MLOps",
  "Product",
  "Research",
];

const mapContentsBySection = (contents: { section_key: string; content: Record<string, string> }[] = []) => { // Map content by section key
  return contents.reduce<Record<string, Record<string, string>>>((acc, item) => { // Reduce content array into object map
    acc[item.section_key] = item.content || {}; // Store content by section key
    return acc; // Return accumulator
  }, {}); // End reduce
}; // End mapContentsBySection

export default async function Page({ // Render blog listing page
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string }>;
}) {
  const params = await searchParams; // Await search params
  const page = Number(params.page) || 1; // Resolve current page
  const filter = params.filter || "all"; // Resolve filter
  const siteContent = await getSiteContentByPageKey("blog"); // Fetch CMS content for blog
  const contentMap = mapContentsBySection(siteContent?.contents || []); // Normalize CMS content
  const headerContent = contentMap.header || {}; // Read header content
  const latestContent = contentMap.latest || {}; // Read latest content
  const newsletterContent = contentMap.newsletter || {}; // Read newsletter content
  const searchContent = contentMap.search || {}; // Read search content
  const allPosts = await getAllPosts(page, filter as "all" | "published" | "draft");
  const { post } = await getPinnedPosts();
  console.log(post);
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="container mx-auto">
        <div className="w-full px-4 pb-16 pt-10 lg:px-8">
          <header className="space-y-4">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Categories", href: "/categories" },
                { label: "Artificial Intelligence" },
              ]}
            />
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              {headerContent.title || "Artificial Intelligence"}
            </h1>{/* CMS header title */}
            <p className="max-w-2xl text-base text-slate-600">
              {headerContent.description ||
                "Explore the latest research, product design stories, and practical guidance on building with AI."}
            </p>{/* CMS header description */}
          </header>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <main className="space-y-10">
              {/* pinned post */}
              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="relative">
                  <div className="relative h-56 w-full sm:h-72 lg:h-80">
                    <Image
                      src={post?.featured_image_url || ""}
                      alt={post?.title || ""}
                      fill
                      loading="eager"

                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 900px"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm">
                      Feature story
                    </span>
                  </div>
                  <div className="space-y-4 p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="font-semibold text-primary">{post?.category?.name || ""}</span>
                      <span className="text-slate-300">•</span>
                      <span>{post?.read_time || ""}</span>
                      <span className="text-slate-300">•</span>
                      <span>Just now</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                      {post?.title || ""}
                    </h2>
                    <p className="text-sm text-slate-600 sm:text-base">
                      {post?.excerpt || ""}
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-200">
                        <Image
                          src={heroAuthor.avatar}
                          alt={heroAuthor.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        {heroAuthor.name}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* latest posts */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {latestContent.title || "Latest posts"}
                  </h2>{/* CMS latest title */}
                  <button className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300">
                    {latestContent.subtitle || "View all"}
                  </button>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {allPosts?.posts?.map((post: PostType) => (
                    <PostCard key={post.id} slug={post.slug} title={post.title} excerpt={post.excerpt || undefined} category={post.category?.name || undefined} date={post.published_at || undefined} image={post.featured_image_url || undefined} />
                  ))}
                </div>
                <div className="flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={allPosts?.totalPages || 1}
                    query={{ filter }}
                  />
                </div>
              </section>
            </main>

            <aside className="space-y-6 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full bg-slate-200">
                    <Image
                      src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80"
                      alt="Author profile"
                      fill
                      loading="eager"
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Maya L. Chen
                    </p>
                    <p className="text-xs text-slate-600">AI Research Lead</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600">
                  Writing about human-centered AI, product strategy, and how to build with
                  responsibility.
                </p>
                <button className="mt-4 w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                  Follow
                </button>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {searchContent.title || "Search"}
                </h3>{/* CMS search title */}
                <input
                  type="text"
                  placeholder={searchContent.subtitle || "Search articles"}
                  className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-900 outline-none focus:border-primary"
                />
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Categories
                </h3>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
                    >
                      <span>{category}</span>
                      <span className="text-xs text-slate-400">12</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {newsletterContent.title || "Newsletter"}
                </h3>{/* CMS newsletter title */}
                <p className="mt-3 text-sm text-slate-600">
                  {newsletterContent.description || "Get new posts and deep dives delivered weekly."}
                </p>{/* CMS newsletter description */}
                <NewsletterSubscribeButton />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
