"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getPostBySlug } from "@/lib/action";
import { PostType } from "@/lib/type";
import Image from "next/image";
import {
  User,
  FolderOpen,
  Calendar,
  Clock,
  Tag,
  FileText,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface PostWithAuthor extends PostType {
  author?: { id: number; name: string; email: string };
  comment_count?: string | number;
  pending_comment_count?: string | number;
}

interface PostViewModalProps {
  slug: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PostViewModal({
  slug,
  open,
  onOpenChange,
}: PostViewModalProps) {
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !slug) {
      setPost(null);
      return;
    }
    let cancelled = false;
    async function fetchPost() {
      setLoading(true);
      setPost(null);
      try {
        const data = await getPostBySlug(slug as string);
        if (!cancelled && data) setPost(data as PostWithAuthor);
      } catch (error) {
        console.error("Error fetching post:", error);
        if (!cancelled) setPost(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPost();
    return () => {
      cancelled = true;
    };
  }, [open, slug]);

  const metaKeywords =
    post?.meta_keywords && Array.isArray(post.meta_keywords)
      ? post.meta_keywords
      : post?.tags ?? [];
  const tagsDisplay = Array.isArray(metaKeywords) ? metaKeywords : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] w-full overflow-y-auto min-w-0 sm:max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-6xl "
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="sr-only">View post</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          </div>
        )}

        {!loading && post && (
          <div className="space-y-6">
            {/* Title & status */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={post.is_published ? "default" : "secondary"}
                  className={post.is_published ? "bg-green-600" : ""}
                >
                  {post.is_published ? "Published" : "Draft"}
                </Badge>
                {post.slug && (
                  <Link
                    href={`/console/posts/${post.slug}`}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Edit <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Meta row: author, category, date, read time */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
              {post.author && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {post.author.name}
                  <span className="text-slate-400">({post.author.email})</span>
                </span>
              )}
              {post.category && (
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="h-4 w-4" />
                  {post.category.name}
                </span>
              )}
              {post.created_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.created_at).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </span>
              )}
              {post.read_time != null && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.read_time} min read
                </span>
              )}
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-slate-600 dark:text-slate-400 border-l-2 border-primary/50 pl-4">
                {post.excerpt}
              </p>
            )}

            {/* Featured image */}
            {post.featured_image_url && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image
                  src={post.featured_image_url}
                  alt={post.featured_image_alt || post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                />
                {post.featured_image_caption && (
                  <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm px-3 py-2">
                    {post.featured_image_caption}
                  </p>
                )}
              </div>
            )}

            {/* Rich text content */}
            {post.content && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Content
                </h2>
                <div
                  className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary prose-img:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            )}

            {/* SEO meta */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                SEO & Meta
              </h2>
              <dl className="grid gap-2 text-sm">
                {post.meta_title && (
                  <>
                    <dt className="font-medium text-slate-500 dark:text-slate-400">
                      Meta title
                    </dt>
                    <dd className="text-slate-900 dark:text-slate-100">
                      {post.meta_title}
                    </dd>
                  </>
                )}
                {post.meta_description && (
                  <>
                    <dt className="font-medium text-slate-500 dark:text-slate-400">
                      Meta description
                    </dt>
                    <dd className="text-slate-900 dark:text-slate-100">
                      {post.meta_description}
                    </dd>
                  </>
                )}
                {post.canonical_url && (
                  <>
                    <dt className="font-medium text-slate-500 dark:text-slate-400">
                      Canonical URL
                    </dt>
                    <dd className="text-slate-900 dark:text-slate-100 break-all">
                      {post.canonical_url}
                    </dd>
                  </>
                )}
              </dl>
            </div>

            {/* Tags & comments */}
            <div className="flex flex-wrap items-center gap-2">
              {tagsDisplay.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-slate-500" />
                  {tagsDisplay.map((tag: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {(Number(post.comment_count) > 0 ||
                Number(post.pending_comment_count) > 0) && (
                <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <MessageSquare className="h-4 w-4" />
                  {post.comment_count} comments
                  {Number(post.pending_comment_count) > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {post.pending_comment_count} pending
                    </Badge>
                  )}
                </span>
              )}
            </div>
          </div>
        )}

        {!loading && !post && slug && (
          <p className="py-8 text-center text-slate-500">
            Post not found or failed to load.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
