"use client";

import { getPostBySlug } from "@/lib/action";
import { PostType } from "@/lib/type";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<PostType | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      try {
        const data = await getPostBySlug(slug);
        setPost(data);
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

    fetchPost();
  }, [slug]);

  if (!post) return <div>Loading...</div>;

  console.log("post data by slug:", post);

  return (
    <div className="p-5">
      <div className="max-w-4xl mx-auto p-6 space-y-8 bg-white dark:bg-slate-900 rounded-lg ">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {post.title}
          </h1>

          <p className="text-sm text-slate-500 mt-2">Slug: {post.slug}</p>
        </div>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="relative w-full h-[400px] rounded overflow-hidden">
            <Image
              src={post?.featured_image_url}
              alt={post?.featured_image_alt || post?.title}
              fill
              className="object-cover"
            />
            {post.featured_image_caption && (
              <p className="text-sm text-center text-slate-500 mt-2">
                {post.featured_image_caption}
              </p>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
          <p>
            <b>Category ID:</b> {post.category_id ?? "N/A"}
          </p>
          <p>
            <b>Schema Type:</b> {post.schema_type}
          </p>
          <p>
            <b>Read Time:</b> {post.read_time} min
          </p>
          <p>
            <b>Likes:</b> ❤️ {post.likes}
          </p>
          <p>
            <b>Published:</b> {post.is_published ? "Yes" : "No"}
          </p>
          <p>
            <b>Published At:</b> {post.published_at || "Not published"}
          </p>
        </div>

        {/* Tags */}
        {post && post.tags && post?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post?.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <blockquote className="border-l-4 border-slate-300 pl-4 text-slate-600 dark:text-slate-400 italic">
            {post.excerpt}
          </blockquote>
        )}

        {/* Content */}
        <div
          className="
                      prose 
                      prose-lg 
                      prose-slate 
                      dark:prose-invert 
                      max-w-none
                
                      prose-h1:text-4xl
                      prose-h1:font-bold
                      prose-h1:mb-4
                
                      prose-h2:text-3xl
                      prose-h2:font-semibold
                
                      prose-h3:text-2xl
                      prose-h3:font-medium
                
                      prose-p:text-base
                      prose-p:leading-7
                      prose-p:text-slate-700
                      dark:prose-p:text-slate-300
                
                      prose-a:text-blue-600
                      prose-a:underline
                
                      prose-img:rounded-lg
                      prose-img:shadow
                    "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* SEO Section */}
        <div className="border-t pt-6 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <p>
            <b>Meta Title:</b> {post.meta_title}
          </p>
          <p>
            <b>Meta Description:</b> {post.meta_description}
          </p>
          <p>
            <b>Meta Keywords:</b> {post.meta_keywords?.join(", ") || "N/A"}
          </p>
          <p>
            <b>Canonical URL:</b> {post.canonical_url}
          </p>
        </div>

        {/* Comments */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-2">Comments</h3>
          {post.comments && post.comments?.length > 0 ? (
            post.comments.map((comment: any, i: number) => (
              <div
                key={i}
                className="border border-slate-200 dark:border-slate-800 p-3 rounded mb-2 text-sm"
              >
                {JSON.stringify(comment)}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No comments yet</p>
          )}
        </div>

        {/* Interactions */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-2">Interactions</h3>
          {post.interactions && post.interactions?.length > 0 ? (
            post.interactions.map((item: any, i: number) => (
              <div
                key={i}
                className="text-sm text-slate-600 dark:text-slate-400"
              >
                {JSON.stringify(item)}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No interactions recorded</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-6 text-xs text-slate-500 flex justify-between">
          <span>Created: {post.created_at}</span>
          <span>Updated: {post.updated_at}</span>
        </div>
      </div>
    </div>
  );
}
