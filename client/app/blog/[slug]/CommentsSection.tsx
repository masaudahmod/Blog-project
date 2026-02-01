"use client";

import { CircleUser } from "lucide-react";
import { useEffect, useState } from "react";
import { addComment, getPostComments, logActivity } from "@/lib/action";
import { getDeviceInfo, getUserIdentifier } from "@/lib/userIdentifier";

interface Comment {
  id: number;
  post_id: number;
  user_identifier: string;
  message: string;
  status: string;
  created_at: string;
}

interface CommentsSectionProps {
  postId: number;
  initialComments: Comment[];
}

export default function CommentsSection({
  postId,
  initialComments,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentLoading, setCommentLoading] = useState(false);
  const [writeComponent, setWriteComponent] = useState(false);
  const [userComment, setUserComment] = useState("");
  const [userIdentifier, setUserIdentifier] = useState("");

  useEffect(() => {
    setUserIdentifier(getUserIdentifier());
  }, []);

  const refreshComments = async () => {
    try {
      const commentsData = await getPostComments(postId);
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!userComment.trim() || !postId || !userIdentifier) {
      alert("Please enter a comment");
      return;
    }

    try {
      setCommentLoading(true);
      const result = await addComment({
        post_id: postId,
        user_identifier: userIdentifier,
        message: userComment.trim(),
      });

      if (result.success) {
        alert(result.message || "Comment submitted! It will be reviewed before being published.");
        setWriteComponent(false);
        setUserComment("");
        await refreshComments();

        logActivity({
          post_id: postId,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-900">Comments</h2>
        <p className="text-sm text-slate-500">
          Share your thoughts or ask a question about this article.
        </p>
      </div>

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-slate-200/80 p-4"
            >
              <div className="flex items-start gap-3">
                <CircleUser className="text-slate-400" size={22} />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">
                    Anonymous User • {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-sm text-slate-900">
                    {comment.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No comments yet. Be the first to comment.</p>
      )}

      <div className="space-y-4">
        <button
          className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
          onClick={() => setWriteComponent(!writeComponent)}
        >
          {writeComponent ? "Close comment form" : "Add a comment"}
        </button>

        {writeComponent && (
          <div className="space-y-4 rounded-2xl border border-slate-200/80 p-4">
            <textarea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              className="w-full min-h-[120px] rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-primary"
              placeholder="Write your comment here..."
              rows={4}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Your comment will be reviewed before being published.
              </p>
              <button
                onClick={handleCommentSubmit}
                disabled={commentLoading || !userComment.trim()}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {commentLoading ? "Submitting..." : "Submit comment"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
