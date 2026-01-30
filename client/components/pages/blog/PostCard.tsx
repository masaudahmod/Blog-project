import Link from "next/link";
import Image from "next/image";


export function PostCard({
    title,
    slug,
    excerpt,
    category,
    date,
    image,
}: {
    title?: string;
    slug?: string;
    excerpt?: string;
    category?: string;
    date?: string;
    image?: string;
}) {
    return (
        <article className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-900">
            <Link href={`/blog/${slug}`}>
                <div className="relative h-40 w-full overflow-hidden">
                    {image && (
                        <Image
                            src={image}
                            alt={title || ""}
                            fill
                            className="object-cover transition duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 380px"
                        />
                    )}
                </div>
                <div className="space-y-2 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                            {category || ""}
                        </span>
                        <span>{date || ""}</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{excerpt}</p>
                </div>
            </Link>
        </article>
    );
}