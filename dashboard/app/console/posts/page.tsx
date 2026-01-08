"use client";

import { getAllPosts, updatePostPublishStatus, deletePost } from "@/lib/action";
import { PostType } from "@/lib/type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Eye, EyeOff, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmPostDelete from "@/app/(components)/ConfirmPostDelete";

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentFilter = searchParams.get("filter") || "all";

  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, currentFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getAllPosts(currentPage, currentFilter);
      if (data && data.posts) {
        setPosts(data.posts);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (postId: number, currentStatus: boolean) => {
    try {
      setUpdating(postId);
      const result = await updatePostPublishStatus(postId, !currentStatus);
      if (result.success) {
        toast.success(result.data.message || "Post status updated");
        fetchPosts(); // Refresh list
      } else {
        toast.error(result.message || "Failed to update post status");
      }
    } catch (error) {
      toast.error("Failed to update post status");
      console.error(error);
    } finally {
      setUpdating(null);
    }
  };

  const updateFilter = (filter: string) => {
    router.push(`?page=1&filter=${filter}`);
  };

  const updatePage = (page: number) => {
    router.push(`?page=${page}&filter=${currentFilter}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Posts</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b pb-4">
        <Button
          variant={currentFilter === "all" ? "default" : "outline"}
          onClick={() => updateFilter("all")}
          size="sm"
        >
          All
        </Button>
        <Button
          variant={currentFilter === "published" ? "default" : "outline"}
          onClick={() => updateFilter("published")}
          size="sm"
        >
          Published
        </Button>
        <Button
          variant={currentFilter === "draft" ? "default" : "outline"}
          onClick={() => updateFilter("draft")}
          size="sm"
        >
          Draft
        </Button>
      </div>

      {/* Posts Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No posts found
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post: PostType & { author?: any; comment_count?: number; pending_comment_count?: number }) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/console/posts/${post.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {post.category?.name || "Uncategorized"}
                  </TableCell>
                  <TableCell>
                    {post.author?.name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={post.is_published ? "default" : "secondary"}
                      className={post.is_published ? "bg-green-500" : ""}
                    >
                      {post.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comment_count || 0}</span>
                      {post.pending_comment_count > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {post.pending_comment_count} pending
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.created_at
                      ? new Date(post.created_at).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updating === post.id}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/console/posts/${post.slug}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/console/posts/${post.slug}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handlePublishToggle(post.id, post.is_published)}
                          disabled={updating === post.id}
                        >
                          {post.is_published ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
                              try {
                                setUpdating(post.id);
                                const result = await deletePost(post.id);
                                if (result.ok) {
                                  toast.success("Post deleted successfully");
                                  fetchPosts();
                                } else {
                                  toast.error("Failed to delete post");
                                }
                              } catch (error) {
                                toast.error("Failed to delete post");
                                console.error(error);
                              } finally {
                                setUpdating(null);
                              }
                            }
                          }}
                          disabled={updating === post.id}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => updatePage(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => updatePage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
