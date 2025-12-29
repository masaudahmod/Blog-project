"use client";

import LikedComponent from "@/app/(components)/LikedComponent";
import PostSkeleton from "@/app/(components)/PostSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addComment, getPostBySlug } from "@/lib/action";
import { CommentType, InteractionType, PostType } from "@/lib/type";
import { CircleUser } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(false);
  const [writeComponent, setWriteComponent] = useState(false);
  const [userName, setUserName] = useState("");
  const [userComment, setUserComment] = useState("");

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

  const handleCommentSubmit = async () => {
    if (!userName || !userComment) return;
    try {
      setLoading(true);
      const result = await addComment({
        id: post?.id || "",
        userName,
        message: userComment,
      });
      if (result) {
        toast.success("Comment added successfully");
        setWriteComponent(false);
        setUserName("");
        setUserComment("");
        setLoading(false);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  if (!post) return <PostSkeleton />;
  return (
    <div className="p-5">
      <div className="mx-auto p-6 space-y-8 rounded-lg">
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
              priority
              className="object-cover"
              loading="eager"
              sizes="
                (max-width: 640px) 100vw,
                (max-width: 1024px) 90vw,
                1200px
              "
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
          className="prose max-w-none dark:prose-invert 
          prose-h1:text-4xl
          prose-h2:text-3xl
          prose-h3:text-2xl
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* <div>{post.content}</div> */}

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

        <div>
          <h2 className="text-2xl font-semibold mb-4">Like post</h2>
          {/* <Button
            variant="outline"
            className="mb-4"
            onClick={() => handleLikePost()}
          >
            {likeLoading ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-heart-icon lucide-heart"
              >
                <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-heart-icon lucide-heart"
              >
                <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
              </svg>
            )}
          </Button> */}
          <LikedComponent slug={post.slug} initialLikes={post.likes || 0} />
        </div>
        {/* Comments */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-2">Comments</h3>
          {post.comments && post.comments?.length > 0 ? (
            post.comments.map((comment: CommentType, i: number) => (
              <div
                key={i}
                className="border flex items-center gap-5 border-slate-200 dark:border-slate-800 p-3 rounded mb-2 text-sm"
              >
                <CircleUser />
                <div className="mt-2">
                  <p>{comment.author}</p>
                  <p>
                    <b>Comment:</b> {comment.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No comments yet</p>
          )}
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => setWriteComponent(!writeComponent)}
          >
            {writeComponent ? "Close Comment Form" : "Add a Comment"}
          </Button>
          {writeComponent && (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  type="text"
                  className="w-full mb-2 transition duration-300 ease-in-out border border-slate-300 dark:border-slate-700 p-2 rounded"
                  placeholder="Please enter your name"
                />
                <h4 className="font-semibold mb-2 text-left md:text-right">
                  Write Comment
                </h4>
              </div>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                className="w-full transition duration-300 ease-in-out border border-slate-300 dark:border-slate-700 p-2 rounded"
                rows={4}
                placeholder="Write your comment here..."
              ></textarea>
              <Button
                variant="default"
                className="mt-3"
                onClick={handleCommentSubmit}
              >
                {loading ? "Submitting..." : "Submit Comment"}
              </Button>
            </div>
          )}
        </div>

        {/* Interactions */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-2">Interactions</h3>
          {post.interactions && post.interactions?.length > 0 ? (
            post.interactions.map((item: InteractionType, i: number) => (
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
