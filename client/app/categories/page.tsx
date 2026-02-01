import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  getCategories,
  getPostsByCategory,
  getSiteContentByPageKey,
} from "@/lib/action";
import { PostType } from "@/types";
import Pagination from "@/components/Pagination";
import NewsletterSubscribeButton from "@/components/NewsletterSubscribeButton";
import { ArrowRight } from "lucide-react";

const POPULAR_LIMIT = 3;
const POSTS_PER_PAGE = 9;

// Fallback description when category has no description in DB
const categoryDescription = (name: string) =>
  `Deep dives into the latest in ${name}, best practices, and expert analysis. Stay ahead with our curated articles.`;

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; page?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params.cat?.trim() || undefined;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const [allCategories, siteContent] = await Promise.all([
    getCategories({ withCount: true }),
    getSiteContentByPageKey("blog"),
  ]);

  const contents = (siteContent?.contents || []) as { section_key: string; content?: Record<string, string> }[];
  const contentMap = contents.reduce(
    (acc: Record<string, Record<string, string>>, item) => {
      acc[item.section_key] = item.content || {};
      return acc;
    },
    {} as Record<string, Record<string, string>>
  );
  const newsletterContent = contentMap.newsletter || {};

  // No category selected: show category picker
  if (!categorySlug) {
    const categories = (allCategories || []) as {
      id: number;
      name: string;
      slug: string;
      post_count?: number;
    }[];
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Categories" },
            ]}
            className="mb-6"
          />
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Trending Category
            </span>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Browse by category
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Choose a category to explore articles and insights.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.length === 0 ? (
              <p className="col-span-full text-slate-500">No categories yet.</p>
            ) : (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories?cat=${encodeURIComponent(cat.slug)}`}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                >
                  <span className="font-semibold text-slate-900 group-hover:text-primary">
                    {cat.name}
                  </span>
                  <span className="text-sm text-slate-400">
                    {typeof cat.post_count === "number" ? cat.post_count : 0}{" "}
                    articles
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fetch category posts and popular (first page, small limit for sidebar)
  const [categoryData, popularData] = await Promise.all([
    getPostsByCategory({
      categorySlug,
      page,
      limit: POSTS_PER_PAGE,
      filter: "published",
    }),
    getPostsByCategory({
      categorySlug,
      page: 1,
      limit: POPULAR_LIMIT,
      filter: "published",
    }),
  ]);

  const category = categoryData?.category ?? null;
  const posts = categoryData?.posts ?? [];
  const pagination = categoryData?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
  };
  const popularPosts = (popularData?.posts ?? []) as PostType[];

  // Related tags from current page posts
  const relatedTags = Array.from(
    new Set(
      (posts as PostType[])
        .flatMap((p) => p.tags || [])
        .filter((t): t is string => typeof t === "string" && t.length > 0)
    )
  ).slice(0, 12);

  if (!category) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 lg:px-8">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Categories", href: "/categories" }, { label: "Not found" }]}
            className="mb-6"
          />
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Category not found</h2>
            <p className="mt-2 text-slate-600">The category you’re looking for doesn’t exist or was removed.</p>
            <Link
              href="/categories"
              className="mt-4 inline-block text-primary font-medium hover:underline"
            >
              View all categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryName = category.name;
  const description = categoryDescription(categoryName);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Categories", href: "/categories" },
            { label: categoryName },
          ]}
          className="mb-6"
        />

        {/* Header */}
        <header className="mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Trending Category
          </span>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            {categoryName}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">{description}</p>
        </header>

        {/* Filter & Sort bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Filter tags:
            </span>
            <span className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">
              All Topics
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">Sort by:</span>
            <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              Newest
            </span>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* Main: article grid */}
          <main>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {(posts as PostType[]).map((post) => (
                <article
                  key={post.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative h-44 w-full overflow-hidden">
                      {post.featured_image_url ? (
                        <Image
                          src={post.featured_image_url}
                          alt={post.title || ""}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-slate-200" />
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 shadow-sm">
                        {post.category?.name || categoryName}
                      </span>
                    </div>
                    <div className="space-y-2 p-4">
                      <p className="text-xs text-slate-500">
                        {post.author?.name || "Author"} ·{" "}
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : ""}{" "}
                        · {post.read_time ? `${post.read_time} min read` : ""}
                      </p>
                      <h2 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-primary">
                        {post.title}
                      </h2>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {post.excerpt || ""}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                        Read Article
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {posts.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
                <p className="text-slate-600">No articles in this category yet.</p>
                <Link href="/blog" className="mt-2 inline-block text-primary font-medium hover:underline">
                  Browse all posts
                </Link>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                basePath="/categories"
                query={{ cat: categorySlug }}
                showFirstLast={false}
              />
            </div>
          </main>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            {/* Popular in category */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                Popular in {categoryName}
              </h3>
              <ul className="mt-4 space-y-4">
                {popularPosts.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/blog/${p.slug}`}
                      className="flex gap-3 group"
                    >
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                        {p.featured_image_url ? (
                          <Image
                            src={p.featured_image_url}
                            alt=""
                            fill
                            className="object-cover transition group-hover:scale-105"
                            sizes="80px"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-primary">
                          {p.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {p.read_time ? `${p.read_time} min read` : ""}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">
                  {newsletterContent.title || `${categoryName} Weekly`}
                </h3>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {newsletterContent.description ||
                  `Get the latest ${categoryName.toLowerCase()} news and articles delivered to your inbox.`}
              </p>
              <NewsletterSubscribeButton />
            </div>

            {/* Related tags */}
            {relatedTags.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Related Tags
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {relatedTags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
