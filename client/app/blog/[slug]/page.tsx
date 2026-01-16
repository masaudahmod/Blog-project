"use client";

import {
  getPostBySlug,
  getPostComments,
  addComment,
  likePost,
  unlikePost,
  checkLikeStatus,
  getLikeCount,
  logActivity,
} from "@/lib/action";
import { getUserIdentifier, getDeviceInfo } from "@/lib/userIdentifier";
import { CircleUser, Heart } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Comment {
  id: number;
  post_id: number;
  user_identifier: string;
  message: string;
  status: string;
  created_at: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [writeComponent, setWriteComponent] = useState(false);
  const [userComment, setUserComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userIdentifier, setUserIdentifier] = useState<string>("");

  // Initialize user identifier
  useEffect(() => {
    if (typeof window !== "undefined") {
      const identifier = getUserIdentifier();
      setUserIdentifier(identifier);
    }
  }, []);

  // Fetch post data
  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getPostBySlug(slug);
        if (data) {
          setPost(data);
          setLikeCount(data.likes || 0);

          // Log view activity
          if (userIdentifier && data.id) {
            logActivity({
              post_id: data.id,
              user_identifier: userIdentifier,
              action_type: "view",
              device_info: getDeviceInfo(),
            });
          }
        }
      } catch (error) {
        console.error("Error fetching post data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, userIdentifier]);

  // Fetch comments
  useEffect(() => {
    if (!post?.id) return;
    const fetchComments = async () => {
      try {
        const commentsData = await getPostComments(post.id);
        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, [post]);

  // Check like status
  useEffect(() => {
    if (!post?.id || !userIdentifier) return;
    const checkLike = async () => {
      try {
        const hasLiked = await checkLikeStatus({
          post_id: post.id,
          user_identifier: userIdentifier,
        });
        setLiked(hasLiked);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };
    checkLike();
  }, [post, userIdentifier]);

  // Get like count
  useEffect(() => {
    if (!post?.id) return;
    const fetchLikeCount = async () => {
      try {
        const count = await getLikeCount(post.id);
        setLikeCount(count);
      } catch (error) {
        console.error("Error fetching like count:", error);
      }
    };
    fetchLikeCount();
  }, [post]);

  const handleCommentSubmit = async () => {
    if (!userComment.trim() || !post?.id || !userIdentifier) {
      alert("Please enter a comment");
      return;
    }

    try {
      setCommentLoading(true);
      const result = await addComment({
        post_id: post.id,
        user_identifier: userIdentifier,
        message: userComment.trim(),
      });

      if (result.success) {
        alert(result.message || "Comment submitted! It will be reviewed before being published.");
        setWriteComponent(false);
        setUserComment("");

        // Refresh comments
        const commentsData = await getPostComments(post.id);
        setComments(commentsData);

        // Log activity
        logActivity({
          post_id: post.id,
          user_identifier: userIdentifier,
          action_type: "comment",
          device_info: getDeviceInfo(),
        });
      } else {
        alert(result.message || "Failed to submit comment");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to submit comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!post?.id || !userIdentifier) return;

    const prevLiked = liked;
    const prevCount = likeCount;

    // Optimistic update
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setLikeLoading(true);

    try {
      if (prevLiked) {
        const result = await unlikePost({
          post_id: post.id,
          user_identifier: userIdentifier,
        });
        if (!result.success) throw new Error("Failed to unlike");
      } else {
        const result = await likePost({
          post_id: post.id,
          user_identifier: userIdentifier,
        });
        if (!result.success) throw new Error("Failed to like");

        // Log activity
        logActivity({
          post_id: post.id,
          user_identifier: userIdentifier,
          action_type: "like",
          device_info: getDeviceInfo(),
        });
      }

      // Update like count from server
      const count = await getLikeCount(post.id);
      setLikeCount(count);
    } catch (error) {
      // Rollback
      setLiked(prevLiked);
      setLikeCount(prevCount);
      alert("Failed to update like");
      console.error(error);
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-xl text-slate-600 dark:text-slate-400 italic">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
            <Image
              src={post.featured_image_url}
              alt={post.featured_image_alt || post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
            {post.featured_image_caption && (
              <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm p-4 text-center">
                {post.featured_image_caption}
              </p>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 border-b pb-4">
          {post.category && (
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
              {post.category.name}
            </span>
          )}
          {post.read_time && (
            <span>⏱️ {post.read_time} min read</span>
          )}
          {post.created_at && (
            <span>📅 {new Date(post.created_at).toLocaleDateString()}</span>
          )}
        </div>

        {/* Content */}
        <div
          className="prose prose-slate max-w-none dark:prose-invert 
          prose-h1:text-4xl prose-h1:font-bold
          prose-h2:text-3xl prose-h2:font-semibold
          prose-h3:text-2xl
          prose-ol:list-decimal prose-ul:list-disc
          ql-editor"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {post.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Like Section */}
        <div className="border-t pt-6">
            <button
            onClick={handleLikeToggle}
            disabled={likeLoading}
            className="flex items-center gap-2"
          >
            <Heart className={liked ? "fill-red-500 text-red-500" : ""} size={20} />
            {liked ? "Liked" : "Like"}
          </button>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {likeCount} {likeCount === 1 ? "person" : "people"} liked this post
          </p>
        </div>

        {/* Comments Section */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">Comments</h2>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4 mb-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border border-slate-200 dark:border-slate-800 p-4 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <CircleUser className="text-slate-400 mt-1" size={24} />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                        Anonymous User • {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-slate-900 dark:text-white">{comment.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 mb-6">No comments yet. Be the first to comment!</p>
          )}

          {/* Comment Form */}
          <button
            className="mb-4"
            onClick={() => setWriteComponent(!writeComponent)}
          >
            {writeComponent ? "Close Comment Form" : "Add a Comment"}
          </button>

          {writeComponent && (
            <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-lg space-y-4">
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                className="w-full min-h-[100px] p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Write your comment here..."
                rows={4}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">
                  Your comment will be reviewed before being published.
                </p>
                <button
                  onClick={handleCommentSubmit}
                  disabled={commentLoading || !userComment.trim()}
                >
                  {commentLoading ? "Submitting..." : "Submit Comment"}
                </button>
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
