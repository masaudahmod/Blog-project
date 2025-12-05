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
  const Categories = await getAllCategories();
  console.log(Categories);
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
            {Categories.map((category: Category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>{category.created_at}</TableCell>
                <TableCell className="flex items-center gap-3">
                  {" "}
                  action
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
