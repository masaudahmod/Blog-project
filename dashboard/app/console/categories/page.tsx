import ConfirmCategoryDelete from "@/app/(components)/ConfirmCategoryDelete";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllCategories } from "@/lib/action";
import { Category } from "@/lib/type";

export default async function Page() {
  const categories = await getAllCategories();

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
            {categories?.map((category: Category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>
                  {category?.created_at
                    ? new Date(category?.created_at).toDateString()
                    : "-"}
                </TableCell>
                <TableCell className="flex items-center gap-3">
                  <ConfirmCategoryDelete categoryId={category.id} />
                </TableCell>
              </TableRow>
            ))}
            {categories?.length === 0 && (
              <TableRow>
                <TableCell className="text-center text-base" colSpan={4}>
                  No categories found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
