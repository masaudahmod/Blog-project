import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLikeCount, getPostBySlug, getPostComments } from "@/lib/action";
import CommentsSection from "./CommentsSection";
import LikeSection from "./LikeSection";
import NewsletterSubscription from "@/components/NewsletterSubscription";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildContentWithToc(html: string) {
  if (!html) {
    return { html: "", toc: [] as TocItem[] };
  }

  const toc: TocItem[] = [];
  const contentWithAnchors = html.replace(
    /<h([2-3])([^>]*)>(.*?)<\/h\1>/gi,
    (match, level, attrs, inner) => {
      const text = stripHtml(inner);
      if (!text) return match;

      const existingIdMatch = attrs.match(/\sid=["']([^"']+)["']/i);
      const id = existingIdMatch ? existingIdMatch[1] : slugify(text);

      toc.push({ id, text, level: Number(level) as 2 | 3 });

      if (existingIdMatch) {
        return match;
      }

      return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    }
  );

  return { html: contentWithAnchors, toc };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const [comments, likeCount] = await Promise.all([
    getPostComments(post.id),
    getLikeCount(post.id),
  ]);

  const { html: contentHtml, toc } = buildContentWithToc(post.content || "");
  const relatedPosts = Array.isArray(post.related_posts) ? post.related_posts : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="space-y-10">
            <article className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                    {post.category?.name && (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                        {post.category.name}
                      </span>
                    )}
                    {post.read_time && <span>{post.read_time} min read</span>}
                    {post.created_at && (
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    )}
                  </div>

                  <h1 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                    {post.title}
                  </h1>

                  {post.excerpt && (
                    <p className="text-base text-slate-600 dark:text-slate-300 sm:text-lg">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                {post.featured_image_url && (
                  <div className="relative h-[240px] overflow-hidden rounded-2xl sm:h-[360px] lg:h-[420px]">
                    <Image
                      src={post.featured_image_url}
                      alt={post.featured_image_alt || post.title}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 900px"
                    />
                    {post.featured_image_caption && (
                      <p className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-3 text-center text-sm text-white">
                        {post.featured_image_caption}
                      </p>
                    )}
                  </div>
                )}

                <div
                  className="prose prose-slate max-w-none dark:prose-invert
                    prose-headings:scroll-mt-28
                    prose-h1:text-3xl prose-h1:font-semibold
                    prose-h2:text-2xl prose-h2:font-semibold
                    prose-h3:text-xl prose-h3:font-semibold
                    prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:text-slate-600
                    dark:prose-blockquote:bg-slate-800/60 dark:prose-blockquote:text-slate-200
                    prose-pre:rounded-xl prose-pre:bg-slate-900 prose-pre:text-slate-100
                    ql-editor"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4">
                    {post.tags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>

            <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <LikeSection postId={post.id} initialCount={likeCount} />
            </section>

            <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CommentsSection postId={post.id} initialComments={comments} />
            </section>

            {relatedPosts.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Read next
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedPosts.slice(0, 4).map((related: any) => (
                    <Link
                      key={related.id || related.slug}
                      href={`/blog/${related.slug}`}
                      className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                    >
                      {related.featured_image_url && (
                        <div className="relative h-36 w-full overflow-hidden">
                          <Image
                            src={related.featured_image_url}
                            alt={related.featured_image_alt || related.title}
                            fill
                            className="object-cover transition duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 360px"
                          />
                        </div>
                      )}
                      <div className="space-y-2 p-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {related.title}
                        </p>
                        {related.excerpt && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {related.excerpt}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Table of contents
              </h3>
              <div className="mt-4 border-l border-slate-200 pl-4 text-sm dark:border-slate-700">
                {toc.length > 0 ? (
                  <ul className="space-y-2">
                    {toc.map((item) => (
                      <li
                        key={item.id}
                        className={item.level === 3 ? "pl-3 text-slate-500" : ""}
                      >
                        <a
                          href={`#${item.id}`}
                          className="text-slate-700 transition hover:text-primary dark:text-slate-200"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">No sections available.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Newsletter
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Get the latest posts, deep dives, and tutorials delivered to your inbox.
              </p>
              <div className="mt-4">
                <NewsletterSubscription variant="banner" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
