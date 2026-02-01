"use client";

import { CircleUser, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { addComment, getPostComments, logActivity } from "@/lib/action";
import { getDeviceInfo, getUserIdentifier } from "@/lib/userIdentifier";

export interface Comment {
  id: number;
  post_id: number;
  parent_id: number | null;
  user_identifier: string;
  user_name: string | null;
  message: string;
  status: string;
  created_at: string;
}

interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[];
}

interface CommentsSectionProps {
  postId: number;
  initialComments: Comment[];
}

function buildCommentTree(flat: Comment[]): CommentWithReplies[] {
  const byId = new Map<number, CommentWithReplies>();
  flat.forEach((c) => byId.set(c.id, { ...c, replies: [] }));
  const roots: CommentWithReplies[] = [];
  flat.forEach((c) => {
    const node = byId.get(c.id)!;
    if (c.parent_id == null) {
      roots.push(node);
    } else {
      const parent = byId.get(c.parent_id);
      if (parent) parent.replies.push(node);
      else roots.push(node);
    }
  });
  return roots;
}

function CommentCard({
  comment,
  postId,
  userIdentifier,
  onReply,
  onSubmitted,
  depth = 0,
}: {
  comment: CommentWithReplies;
  postId: number;
  userIdentifier: string;
  onReply: (parentId: number) => void;
  onSubmitted: () => void;
  depth?: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyName, setReplyName] = useState("");
  const [loading, setLoading] = useState(false);
  const isReply = depth > 0;

  const displayName = comment.user_name?.trim() || "Anonymous";

  const handleSubmitReply = async () => {
    if (!replyMessage.trim() || !userIdentifier) return;
    setLoading(true);
    try {
      const result = await addComment({
        post_id: postId,
        user_identifier: userIdentifier,
        message: replyMessage.trim(),
        parent_id: comment.id,
        user_name: replyName.trim() || null,
      });
      if (result.success) {
        setReplyMessage("");
        setReplyName("");
        setShowReplyForm(false);
        onSubmitted();
      } else {
        alert(result.message || "Failed to submit reply");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to submit reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isReply ? "ml-6 sm:ml-8 mt-3 border-l-2 border-slate-200 pl-4" : ""}>
      <div className="rounded-xl border border-slate-200/80 p-4">
        <div className="flex items-start gap-3">
          <CircleUser className="text-slate-400 shrink-0" size={22} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500">
              {displayName} • {new Date(comment.created_at).toLocaleDateString()}
            </p>
            <p className="mt-2 text-sm text-slate-900">{comment.message}</p>
            {!isReply && (
              <button
                type="button"
                className="mt-2 text-xs font-medium text-primary hover:underline flex items-center gap-1"
                onClick={() => {
                  setShowReplyForm((v) => !v);
                  onReply(comment.id);
                }}
              >
                <MessageCircle size={14} />
                Reply
              </button>
            )}
          </div>
        </div>

        {showReplyForm && (
          <div className="mt-4 ml-9 space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
            <input
              type="text"
              value={replyName}
              onChange={(e) => setReplyName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary"
              placeholder="Your name (optional)"
              maxLength={255}
            />
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="w-full min-h-[80px] rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-primary"
              placeholder="Write a reply..."
              rows={3}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubmitReply}
                disabled={loading || !replyMessage.trim()}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Submitting..." : "Submit reply"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyMessage("");
                  setReplyName("");
                }}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {comment.replies.length > 0 && (
          <div className="mt-4 space-y-3">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                postId={postId}
                userIdentifier={userIdentifier}
                onReply={onReply}
                onSubmitted={onSubmitted}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentsSection({
  postId,
  initialComments,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentLoading, setCommentLoading] = useState(false);
  const [writeComponent, setWriteComponent] = useState(false);
  const [userComment, setUserComment] = useState("");
  const [userName, setUserName] = useState("");
  const [userIdentifier, setUserIdentifier] = useState("");
  const [replyingToId, setReplyingToId] = useState<number | null>(null);

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
        parent_id: replyingToId ?? undefined,
        user_name: userName.trim() || undefined,
      });

      if (result.success) {
        alert(result.message || "Comment posted successfully.");
        setWriteComponent(false);
        setUserComment("");
        setUserName("");
        setReplyingToId(null);
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

  const tree = buildCommentTree(comments);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-900">Comments</h2>
        <p className="text-sm text-slate-500">
          Share your thoughts or ask a question about this article.
        </p>
      </div>

      {tree.length > 0 ? (
        <div className="space-y-4">
          {tree.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              postId={postId}
              userIdentifier={userIdentifier}
              onReply={setReplyingToId}
              onSubmitted={refreshComments}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No comments yet. Be the first to comment.</p>
      )}

      <div className="space-y-4">
        <button
          className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
          onClick={() => {
            setWriteComponent(!writeComponent);
            setReplyingToId(null);
          }}
        >
          {writeComponent ? "Close comment form" : "Add a comment"}
        </button>

        {writeComponent && (
          <div className="space-y-4 rounded-2xl border border-slate-200/80 p-4">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary"
              placeholder="Your name (optional)"
              maxLength={255}
            />
            <textarea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              className="w-full min-h-[120px] rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-primary"
              placeholder="Write your comment here..."
              rows={4}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Your comment will appear right away. You can delete it later from the blog dashboard if needed.
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
