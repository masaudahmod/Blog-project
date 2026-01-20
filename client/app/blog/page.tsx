import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getAllPosts } from "@/lib/action";

const heroPost = {
  title: "The Rise of Multimodal Models: How AI Learned to See, Hear, and Speak",
  excerpt:
    "Generative systems now understand text, visuals, and audio together. Here is what that means for real-world products and teams.",
  category: "AI INSIGHTS",
  date: "Jan 16, 2026",
  readTime: "8 min read",
  image:
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80",
};

const heroAuthor = {
  name: "Sarah Jenkins",
  avatar:
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80",
};

const posts = [
  {
    id: 1,
    title: "Understanding Transformer Networks",
    excerpt:
      "A quick primer on attention, embeddings, and why transformers keep winning.",
    category: "Machine Learning",
    date: "Jan 10, 2026",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Neural Architectures in the Edge Era",
    excerpt:
      "Balancing accuracy and latency when deploying models to devices.",
    category: "Edge AI",
    date: "Jan 05, 2026",
    image:
      "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "LLM Fine-Tuning Playbook",
    excerpt:
      "Tactics for creating reliable fine-tunes with limited data.",
    category: "MLOps",
    date: "Dec 28, 2025",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Agentic Workflows in Product Teams",
    excerpt:
      "How to coordinate tools, prompts, and humans for faster delivery.",
    category: "Product",
    date: "Dec 19, 2025",
    image:
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "Debugging Prompt Failures",
    excerpt:
      "A checklist to recover from hallucinations and silent errors.",
    category: "Research",
    date: "Dec 10, 2025",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    title: "RAG Pipelines that Scale",
    excerpt:
      "Indexing, retrieval, and evaluation tips for knowledge agents.",
    category: "Infrastructure",
    date: "Nov 30, 2025",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  },
];

const categories = [
  "Artificial Intelligence",
  "Machine Learning",
  "Edge AI",
  "MLOps",
  "Product",
  "Research",
];

export function PostCard({
  title,
  excerpt,
  category,
  date,
  image,
}: {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-900">
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 380px"
        />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
            {category}
          </span>
          <span>{date}</span>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{excerpt}</p>
      </div>
    </article>
  );
}

export default async function Page() {
  const allPosts = await getAllPosts();
  console.log(allPosts);
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
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
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-600 dark:text-slate-300">
            Insights
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
            Artificial Intelligence
          </h1>
          <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
            Explore the latest research, product design stories, and practical guidance on
            building with AI.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="space-y-10">
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
              <div className="relative">
                <div className="relative h-56 w-full sm:h-72 lg:h-80">
                  <Image
                    src={heroPost.image}
                    alt={heroPost.title}
                    fill
                    loading="eager"
                    
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 900px"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm dark:bg-slate-900/80 dark:text-white">
                    Feature story
                  </span>
                </div>
                <div className="space-y-4 p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-primary">{heroPost.category}</span>
                    <span className="text-slate-300 dark:text-white/20">•</span>
                    <span>{heroPost.readTime}</span>
                    <span className="text-slate-300 dark:text-white/20">•</span>
                    <span>Just now</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
                    {heroPost.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
                    {heroPost.excerpt}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <Image
                        src={heroAuthor.avatar}
                        alt={heroAuthor.name}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {heroAuthor.name}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Latest posts
                </h2>
                <button className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 dark:border-white/10 dark:text-slate-300">
                  View all
                </button>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {posts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            </section>
          </main>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <Image
                    src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80"
                    alt="Author profile"
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Maya L. Chen
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">AI Research Lead</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                Writing about human-centered AI, product strategy, and how to build with
                responsibility.
              </p>
              <button className="mt-4 w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                Follow
              </button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                Search
              </h3>
              <input
                type="text"
                placeholder="Search articles"
                className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                Categories
              </h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10"
                  >
                    <span>{category}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">12</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                Newsletter
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Get new posts and deep dives delivered weekly.
              </p>
              <button className="mt-4 w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-slate-900">
                Subscribe
              </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
