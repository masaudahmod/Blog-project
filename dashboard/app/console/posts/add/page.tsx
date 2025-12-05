"use client";

import Editor from "@/app/(components)/ContentEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Footprints, X } from "lucide-react";
import { addPost, getAllCategories } from "@/lib/action";
import { Category, PostType } from "@/lib/type";

export default function Page() {
  const [preview, setPreview] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>("");
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      const categories = await getAllCategories();
      setCategories(categories);
    }
    fetchCategories();
  }, []);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const url = URL.createObjectURL(selected);

    setPreview(url);
    setFile(selected);
  };

  const removeImage = () => {
    setPreview(null);
    setFile(null);
  };
  
  return (
    <main className="flex-1 flex flex-col">
      {/* TopNavBar */}
      <header className="flex items-center justify-between whitespace-nowrap px-4 mt-5">
        <div className="flex items-center gap-4 text-[#111318] dark:text-white">
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
            Add New Post
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <Button>Save Draft</Button>
        </div>
      </header>

      <form >
        <div className="flex-1 p-8 grid grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            {/* Title and Editor */}
            <div className="flex flex-col gap-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium px-3 text-slate-700 dark:text-slate-300">
                    Post Title
                  </p>
                  <Input
                    type="text"
                    name="title"
                    className="form-input flex w-full rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/50 border-none outline-none bg-white dark:bg-slate-800/50 h-11 px-3 text-sm"
                    placeholder="Post Title"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium px-3 text-slate-700 dark:text-slate-300">
                    Post Slug
                  </p>
                  <Input
                    type="text"
                    name="slug"
                    className="form-input flex w-full rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/50 border-none outline-none bg-white dark:bg-slate-800/50 h-11 px-3 text-sm"
                    placeholder="Post Slug"
                  />
                </div>
              </div>

              {/* Rich Text Editor */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium px-3 pb-2 text-slate-700 dark:text-slate-300">
                  Content
                </p>
                <Editor
                  value={content}
                  onChange={setContent}
                  className="dark:text-white text-black bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-[#111318] dark:text-white">
                  SEO Settings
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Optimize your post for search engines.
                </p>
              </div>

              <div className="p-6 flex flex-col gap-6">
                <label className="flex flex-col">
                  <p className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">
                    Meta Title
                  </p>
                  <Input
                    type="text"
                    name="meta_title"
                    className="form-input flex w-full rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-11 px-3 text-sm"
                    placeholder="Enter meta title"
                  />
                </label>

                <label className="flex flex-col">
                  <p className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">
                    Meta Description
                  </p>
                  <textarea
                    name="meta_description"
                    className="form-textarea w-full rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-24 p-3 text-sm"
                    placeholder="Enter meta description"
                  ></textarea>
                </label>

                <label className="flex flex-col">
                  <p className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">
                    Meta Keywords
                  </p>
                  <textarea
                    name="meta_keywords"
                    className="form-textarea w-full rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-24 p-3 text-sm"
                    placeholder="Enter meta Keywords"
                  ></textarea>
                </label>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* Publishing */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-semibold text-[#111318] dark:text-white">
                  Publishing
                </h3>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Schedule
                  </label>
                  <input
                    name="published_at"
                    type="datetime-local"
                    className="p-3 form-input rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm text-[#111318] dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="p-5 flex justify-between items-center gap-2 max-h-48 overflow-y-auto">
                <Label className="text-base font-medium text-slate-700 dark:text-slate-300">
                  Categories
                </Label>
                <Select name="category_id">
                  <SelectTrigger className="w-[180px] cursor-pointer">
                    <SelectValue placeholder="Select a Category " />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((category: Category) => (
                        <SelectItem
                          className="cursor-pointer"
                          value={category.id.toString()}
                          key={category.id}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-semibold text-[#111318] dark:text-white">
                  Tags
                </h3>
              </div>
              <div className="p-5">
                <Input
                  type="text"
                  name="tags"
                  className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-11 px-3 text-sm text-[#111318] dark:text-white"
                  placeholder="Add new tag"
                />
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-semibold text-[#111318] dark:text-white">
                  Featured Image
                </h3>
              </div>

              <Card className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl">
                <CardContent className="p-2 space-y-1">
                  {/* Upload Box */}
                  {!preview && (
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <div className="flex flex-col items-center pt-5 pb-6">
                          <span className="material-symbols-outlined text-4xl text-slate-500 dark:text-slate-400">
                            upload_file
                          </span>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            SVG, PNG, JPG
                          </p>
                        </div>

                        <Input
                          id="dropzone-file"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFile}
                        />
                      </label>
                    </div>
                  )}

                  {/* Preview Box */}
                  {preview && (
                    <div className="relative w-full h-60 overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm">
                      <Image
                        src={preview}
                        alt="Featured Preview"
                        fill
                        className="object-cover rounded-lg"
                      />

                      {/* Remove Button */}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-3 right-3"
                        onClick={removeImage}
                      >
                        <X className="" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Button type="submit">Publish</Button>
          </div>
        </div>
      </form>
    </main>
  );
}
