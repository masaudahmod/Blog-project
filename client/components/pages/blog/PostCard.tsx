import Link from "next/link";
import Image from "next/image";

export type PostCardVariant = "default" | "front";

export interface PostCardProps {
    title?: string;
    slug?: string;
    excerpt?: string;
    category?: string;
    date?: string;
    image?: string;
    /** Used by "front" variant (e.g. "5 min read") */
    readTime?: string;
    /** "default" = card style, "front" = home/latest style */
    variant?: PostCardVariant;
}

export function PostCard({
    title,
    slug,
    excerpt,
    category,
    date,
    image,
    readTime,
    variant = "default",
}: PostCardProps) {
    const href = `/blog/${slug}`;

    if (variant === "front") {
        return (
            <Link href={href} className="group">
                <article className="h-full">
                    <div className="relative h-48 md:h-56 rounded-xl overflow-hidden mb-4 bg-linear-to-br from-slate-200 to-slate-300">
                        {image ? (
                            <Image
                                src={image}
                                alt={title || ""}
                                fill
                                className="object-cover transition duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <span className="font-medium">{category || ""}</span>
                        {(readTime || date) && (
                            <>
                                <span>·</span>
                                <span>{readTime ?? date}</span>
                            </>
                        )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2">
                        {excerpt}
                    </p>
                </article>
            </Link>
        );
    }

    return (
        <article className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <Link href={href}>
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
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                            {category || ""}
                        </span>
                        <span>{date || ""}</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-600">{excerpt}</p>
                </div>
            </Link>
        </article>
    );
}