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
import { deleteCategory } from "@/lib/action";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ConfirmDeleteProps {
  categoryId: number;
}


export default function ConfirmCategoryDelete({ categoryId }: ConfirmDeleteProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const res = await deleteCategory(id);
      if (res.ok) {
        toast.success("Category deleted successfully");
        setOpen(false); // ✅ modal close
        setLoading(false);
        window.location.reload();
      } else {
        toast.error("Error deleting category");
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
          className="flex cursor-pointer items-center justify-center text-red-600 dark:hover:text-red-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          title="Delete"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this content?
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
            onClick={() => handleDelete(categoryId)}
            className="bg-red-600 cursor-pointer text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
