"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { deletePost } from "@/lib/action";
import { useState } from "react";
import { toast } from "sonner";

interface PostConfirmDeleteProps {
  postId: number;
}

export default function ConfirmPostDelete({ postId }: PostConfirmDeleteProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const res = await deletePost(id);
      if (res.ok) {
        toast.success("Post deleted successfully");
        setLoading(false);
        setOpen(false); // ✅ modal close
        window.location.reload();
      } else {
        toast.error("Error deleting post");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Error deleting content");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex cursor-pointer items-center px-8  justify-center text-red-600 dark:hover:text-red-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          title="Delete"
        >
          Delete
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this post?
        </p>
        <DialogFooter className="mt-4 flex justify-end gap-3">
          <DialogClose asChild>
            <button
              type="button"
              className="bg-gray-200 cursor-pointer text-gray-800 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={() => handleDelete(postId)}
            className="bg-red-600 cursor-pointer text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
