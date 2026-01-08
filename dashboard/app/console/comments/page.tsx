"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getComments,
  updateCommentStatus,
  updateCommentMessage,
  deleteCommentById,
} from "@/lib/action";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CircleUser, Check, X, Edit, Trash2, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Comment {
  id: number;
  post_id: number;
  user_identifier: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  post_title?: string;
  post_slug?: string;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editMessage, setEditMessage] = useState("");

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const status = filter === "all" ? undefined : filter;
      const data = await getComments(status);
      if (data && data.comments) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId: number) => {
    try {
      const result = await updateCommentStatus(commentId, "approved");
      if (result.success) {
        toast.success("Comment approved");
        fetchComments();
      } else {
        toast.error(result.message || "Failed to approve comment");
      }
    } catch (error) {
      toast.error("Failed to approve comment");
    }
  };

  const handleReject = async (commentId: number) => {
    try {
      const result = await updateCommentStatus(commentId, "rejected");
      if (result.success) {
        toast.success("Comment rejected");
        fetchComments();
      } else {
        toast.error(result.message || "Failed to reject comment");
      }
    } catch (error) {
      toast.error("Failed to reject comment");
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const result = await deleteCommentById(commentId);
      if (result.success) {
        toast.success("Comment deleted");
        fetchComments();
      } else {
        toast.error(result.message || "Failed to delete comment");
      }
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const handleEdit = async () => {
    if (!editingComment || !editMessage.trim()) return;

    try {
      const result = await updateCommentMessage(editingComment.id, editMessage.trim());
      if (result.success) {
        toast.success("Comment updated");
        setEditingComment(null);
        setEditMessage("");
        fetchComments();
      } else {
        toast.error(result.message || "Failed to update comment");
      }
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comment Moderation</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and moderate comments from your blog posts
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          onClick={() => setFilter("all")}
        >
          All ({comments.length})
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "ghost"}
          onClick={() => setFilter("pending")}
        >
          Pending ({comments.filter((c) => c.status === "pending").length})
        </Button>
        <Button
          variant={filter === "approved" ? "default" : "ghost"}
          onClick={() => setFilter("approved")}
        >
          Approved ({comments.filter((c) => c.status === "approved").length})
        </Button>
        <Button
          variant={filter === "rejected" ? "default" : "ghost"}
          onClick={() => setFilter("rejected")}
        >
          Rejected ({comments.filter((c) => c.status === "rejected").length})
        </Button>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            No comments found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <CircleUser className="text-slate-400 mt-1" size={24} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900 dark:text-white">
                        Anonymous User
                      </p>
                      {getStatusBadge(comment.status)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      ID: {comment.user_identifier.substring(0, 8)}... •{" "}
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                    {comment.post_title && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Post: <span className="font-medium">{comment.post_title}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Comment Message */}
              <div className="pl-9">
                <p className="text-slate-900 dark:text-white">{comment.message}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pl-9">
                {comment.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(comment.id)}
                      className="flex items-center gap-1"
                    >
                      <Check size={16} />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(comment.id)}
                      className="flex items-center gap-1"
                    >
                      <X size={16} />
                      Reject
                    </Button>
                  </>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingComment(comment);
                        setEditMessage(comment.message);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Edit size={16} />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Comment</DialogTitle>
                      <DialogDescription>
                        Modify the comment message below.
                      </DialogDescription>
                    </DialogHeader>
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      className="min-h-[100px] w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      placeholder="Enter comment message..."
                      rows={4}
                    />
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingComment(null);
                          setEditMessage("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleEdit}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(comment.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
