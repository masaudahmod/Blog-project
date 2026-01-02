import { getAllPosts } from "@/lib/action";
import { PostType } from "@/lib/type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MousePointerClick } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ConfirmPostDelete from "@/app/(components)/ConfirmPostDelete";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const data = await getAllPosts(currentPage);
  const posts = data?.posts;
  const totalPages = data?.totalPages;
  return (
    <>
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Posts</h1>
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts?.map((post: PostType) => (
              <TableRow key={post.id}>
                <TableCell>{post.title}</TableCell>
                <TableCell>{post.category.name}</TableCell>
                <TableCell>
                  {post.is_published ? "Published" : "Not Yet"}
                </TableCell>
                <TableCell>{post.created_at}</TableCell>
                <TableCell className="flex items-center gap-3">
                  {/* <ConfirmDelete /> */}

                  <ContextMenu>
                    <ContextMenuTrigger className="flex items-center justify-center rounded-md text-base">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <MousePointerClick className="cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Right Click To Action</p>
                        </TooltipContent>
                      </Tooltip>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-52">
                      <ContextMenuItem inset className="cursor-pointer">
                        Edit
                        <ContextMenuShortcut>⌘[</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuSeparator />

                      <Link href={`/console/posts/${post.slug}`}>
                        <ContextMenuItem inset className="cursor-pointer">
                          View
                          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
                        </ContextMenuItem>
                      </Link>
                      <ContextMenuSeparator />
                      <ContextMenuItem inset className="cursor-pointer">
                        Unpublished
                        <ContextMenuShortcut>⌘U</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ConfirmPostDelete postId={post.id} />
                    </ContextMenuContent>
                  </ContextMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            {/* Previous Button */}
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              asChild={currentPage > 1}
            >
              {currentPage > 1 ? (
                <Link href={`?page=${currentPage - 1}`}>Previous</Link>
              ) : (
                <span>Previous</span>
              )}
            </Button>

            {/* Next Button */}
            <Button
              variant="outline"
              disabled={currentPage >= totalPages}
              asChild={currentPage < totalPages}
            >
              {currentPage < totalPages ? (
                <Link href={`?page=${currentPage + 1}`}>Next</Link>
              ) : (
                <span>Next</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
