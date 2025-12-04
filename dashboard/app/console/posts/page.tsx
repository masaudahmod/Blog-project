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

export default async function Page() {
  const posts = await getAllPosts();
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
            {posts.map((post: PostType) => (
              <TableRow key={post.id}>
                <TableCell>{post.title}</TableCell>
                <TableCell>{post.category.name}</TableCell>
                <TableCell>
                  {post.is_published ? "Published" : "Not Yet"}
                </TableCell>
                <TableCell>{post.created_at}</TableCell>
                <TableCell>
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

                      <ContextMenuItem inset className="cursor-pointer">
                        View
                        <ContextMenuShortcut>⌘]</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem inset className="cursor-pointer">
                        Delete
                        <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem inset className="cursor-pointer">
                        Unpublished
                        <ContextMenuShortcut>⌘U</ContextMenuShortcut>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
