"use client";

import ConfirmDelete from "@/app/(components)/ConfirmDelete";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteCategory, getAllCategories } from "@/lib/action";
import { Category } from "@/lib/type";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [categories, setCategories] = useState<Category[] | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const categories = await getAllCategories();
      console.log("Categories", categories);
      setLoading(false);
      setCategories(categories);
    };
    fetchCategories();
  }, []);
  // const Categories = await getAllCategories();

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteCategory(id);
      if (res.ok) {
        toast.success("Category deleted successfully");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Error deleting content");
    }
  };
  return (
    <>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Categories</h1>
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                <TableRow>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-8" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-8" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-8" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-8" />
                  </TableCell>
                </TableRow>
              </>
            ) : (
              categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>{category.created_at}</TableCell>
                  <TableCell className="flex items-center gap-3">
                    <ConfirmDelete
                      onConfirm={() => handleDelete(category.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )} 
            {categories?.length === 0 && (
              <TableRow>
                <TableCell className="text-center text-base" colSpan={4}>No categories found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
