"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addCategory } from "@/lib/action";
import { useRouter } from "next/navigation";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await addCategory(formData);
    if (result.ok) {
      toast.success(`${result.data.name} Category added successful!`);
      setLoading(false);
      router.push("/console/categories");
      return;
    }
    if (!result.ok) {
      toast.error(result.message || "Adding category failed");
      setLoading(false);
      return;
    }
    setLoading(false);
  }

  return (
    <>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Add Category</h2>
        <div>
          <div className="flex flex-col gap-4 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium px-3 text-slate-700 dark:text-slate-300">
                    Category Title
                  </p>
                  <Input
                    type="text"
                    name="name"
                    required
                    className="form-input flex w-full rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/50 border-none outline-none bg-white dark:bg-slate-800/50 h-11 px-3 text-sm"
                    placeholder="Post Title"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium px-3 text-slate-700 dark:text-slate-300">
                    Category Slug
                  </p>
                  <Input
                    type="text"
                    name="slug"
                    className="form-input flex w-full rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/50 border-none outline-none bg-white dark:bg-slate-800/50 h-11 px-3 text-sm"
                    placeholder="Post Slug"
                  />
                </div>
                <Button className="w-full" type="submit">
                  {loading ? "Adding..." : "Add Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
