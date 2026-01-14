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
import { X } from "lucide-react";
import { updatePost, getAllCategories, getPostBySlug } from "@/lib/action";
import { Category, PostType } from "@/lib/type";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState([]);
  const [submitAction, setSubmitAction] = useState<"draft" | "publish" | null>(null);
  const [post, setPost] = useState<PostType | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  // Form states
  const [postTitle, setPostTitle] = useState<string | null>("");
  const [postSlug, setPostSlug] = useState<string | null>("");
  const [metaTitle, setMetaTitle] = useState<string | null>("");
  const [metaDescription, setMetaDescription] = useState<string | null>("");
  const [metaKeywords, setMetaKeywords] = useState<string | null>("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [tags, setTags] = useState<string | null>("");
  const [content, setContent] = useState<string | null>("");
  const [file, setFile] = useState<File | null>(null);
  const [featuredImageAlt, setFeaturedImageAlt] = useState<string | null>("");
  const [featuredImageCaption, setFeaturedImageCaption] = useState<string | null>("");

  // Load categories
  useEffect(() => {
    async function fetchCategories() {
      const categories = await getAllCategories();
      setCategories(categories);
    }
    fetchCategories();
  }, []);

  // Load existing post data
  useEffect(() => {
    if (!slug) return;
    
    async function fetchPost() {
      try {
        setLoadingPost(true);
        const postData = await getPostBySlug(slug);
        if (postData) {
          setPost(postData);
          
          // Populate form fields
          setPostTitle(postData.title || "");
          setPostSlug(postData.slug || "");
          setContent(postData.content || "");
          setMetaTitle(postData.meta_title || "");
          setMetaDescription(postData.meta_description || "");
          setMetaKeywords(
            Array.isArray(postData.meta_keywords)
              ? postData.meta_keywords.join(", ")
              : postData.meta_keywords || ""
          );
          setTags(
            Array.isArray(postData.tags) ? postData.tags.join(", ") : postData.tags || ""
          );
          setFeaturedImageAlt(postData.featured_image_alt || "");
          setFeaturedImageCaption(postData.featured_image_caption || "");
          
          // Set existing image preview
          if (postData.featured_image_url) {
            setPreview(postData.featured_image_url);
          }
        } else {
          toast.error("Post not found");
          router.push("/console/posts");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post");
        router.push("/console/posts");
      } finally {
        setLoadingPost(false);
      }
    }
    
    fetchPost();
  }, [slug]);

  // Set selected category after both post and categories are loaded
  useEffect(() => {
    if (post && post.category_id && categories.length > 0 && !selectedCategory) {
      const foundCategory = categories.find(
        (cat: Category) => cat.id === post.category_id
      );
      if (foundCategory) {
        setSelectedCategory(foundCategory);
      }
    }
  }, [post, categories, selectedCategory]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const url = URL.createObjectURL(selected);
    setPreview(url);
    setFile(selected);
    setImageRemoved(false); // Reset remove flag if new image selected
  };

  const removeImage = () => {
    setPreview(null);
    setFile(null);
    setImageRemoved(true);
  };

  // Calculate read_time from content
  const calculateReadTime = (htmlContent: string | null): number => {
    if (!htmlContent) return 1;
    
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    
    return minutes;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    
    if (!post) {
      toast.error("Post data not loaded");
      setLoading(false);
      return;
    }
    
    const fd = new FormData();
    fd.append("title", postTitle || "");
    fd.append("new_slug", postSlug || "");
    fd.append("content", content || "");
    fd.append("meta_title", metaTitle || "");
    fd.append("meta_description", metaDescription || "");
    fd.append("meta_keywords", metaKeywords || "");
    fd.append(
      "category_id",
      selectedCategory ? selectedCategory.id.toString() : ""
    );
    fd.append("tags", tags || "");

    // Add is_published based on submit action
    const isPublished = submitAction === "publish";
    fd.append("is_published", isPublished.toString());

    // Calculate and add read_time
    const readTime = calculateReadTime(content);
    fd.append("read_time", readTime.toString());

    // Generate and add canonical_url
    if (postSlug) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
      const canonicalUrl = `${siteUrl}/posts/${postSlug}`;
      fd.append("canonical_url", canonicalUrl);
    }

    // Add featured image alt and caption
    if (featuredImageAlt) {
      fd.append("featured_image_alt", featuredImageAlt);
    }
    if (featuredImageCaption) {
      fd.append("featured_image_caption", featuredImageCaption);
    }

    // Handle image: new file, remove, or keep existing
    if (file) {
      fd.append("featured_image", file);
    } else if (imageRemoved) {
      fd.append("remove_image", "true");
    }

    const result = await updatePost(slug, fd);
    
    if (result?.ok) {
      toast.success(result?.message || "Post updated successfully!");
      setLoading(false);
      setSubmitAction(null);
      router.push("/console/posts");
      return;
    }
    
    if (!result?.ok) {
      toast.error(result?.message || "Failed to update post!");
      setLoading(false);
      setSubmitAction(null);
      return;
    }
    
    setLoading(false);
    setSubmitAction(null);
  };

  // Handle save draft button click
  const handleSaveDraft = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSubmitAction("draft");
    const form = e.currentTarget.closest("form");
    if (form) {
      form.requestSubmit();
    }
  };

  // Handle publish button click
  const handlePublish = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSubmitAction("publish");
    const form = e.currentTarget.closest("form");
    if (form) {
      form.requestSubmit();
    }
  };

  // Show loading state while fetching post
  if (loadingPost) {
    return (
      <main className="flex-1 flex flex-col">
        <div className="flex items-center justify-center h-96">
          <p className="text-slate-500">Loading post data...</p>
        </div>
      </main>
    );
  }

  // Don't render form if post is not loaded
  if (!post) {
    return null;
  }

  return (
    <main className="flex-1 flex flex-col">
      {/* TopNavBar */}
      <header className="flex items-center justify-between whitespace-nowrap px-4 mt-5">
        <div className="flex items-center gap-4 text-[#111318] dark:text-white">
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
            Edit Post
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSaveDraft}
            disabled={loading}
          >
            {loading && submitAction === "draft" ? "Saving..." : "Save Draft"}
          </Button>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
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
                    onChange={(e) => setPostTitle(e.target.value)}
                    type="text"
                    name="title"
                    value={postTitle || ""}
                    className="form-input flex w-full rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/50 border-none outline-none bg-white dark:bg-slate-800/50 h-11 px-3 text-sm"
                    placeholder="Post Title"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium px-3 text-slate-700 dark:text-slate-300">
                    Post Slug
                  </p>
                  <Input
                    onChange={(e) => {
                      setPostSlug(e.target.value);
                    }}
                    type="text"
                    name="slug"
                    value={postSlug || ""}
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
                    onChange={(e) => setMetaTitle(e.target.value)}
                    type="text"
                    name="meta_title"
                    value={metaTitle || ""}
                    className="form-input flex w-full rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-11 px-3 text-sm"
                    placeholder="Enter meta title"
                  />
                </label>

                <label className="flex flex-col">
                  <p className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">
                    Meta Description
                  </p>
                  <textarea
                    onChange={(e) => setMetaDescription(e.target.value)}
                    name="meta_description"
                    value={metaDescription || ""}
                    className="form-textarea w-full rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-24 p-3 text-sm"
                    placeholder="Enter meta description"
                  ></textarea>
                </label>

                <label className="flex flex-col">
                  <p className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">
                    Meta Keywords
                  </p>
                  <textarea
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    name="meta_keywords"
                    value={metaKeywords || ""}
                    className="form-textarea w-full rounded-lg text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-24 p-3 text-sm"
                    placeholder="Enter meta Keywords (comma-separated)"
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
                <Select
                  onValueChange={(value) => {
                    const foundCategory =
                      categories && categories.length
                        ? categories.find(
                            (cat: Category) => cat.id.toString() === value
                          )
                        : null;
                    setSelectedCategory(foundCategory || null);
                  }}
                  value={selectedCategory?.id.toString() || ""}
                  name="category_id"
                >
                  <SelectTrigger className="w-[180px] cursor-pointer">
                    <SelectValue placeholder="Select a Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories?.map((category: Category) => (
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
                  onChange={(e) => setTags(e.target.value)}
                  type="text"
                  name="tags"
                  value={tags || ""}
                  className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-11 px-3 text-sm text-[#111318] dark:text-white"
                  placeholder="Add new tag (comma-separated)"
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
                    <div className="space-y-4">
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
                          type="button"
                        >
                          <X className="" />
                        </Button>
                      </div>

                      {/* Featured Image Alt and Caption Inputs */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Image Alt Text
                          </p>
                          <Input
                            onChange={(e) => setFeaturedImageAlt(e.target.value)}
                            type="text"
                            name="featured_image_alt"
                            value={featuredImageAlt || ""}
                            className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-11 px-3 text-sm text-[#111318] dark:text-white"
                            placeholder="Alt text for the featured image"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Image Caption
                          </p>
                          <Input
                            onChange={(e) => setFeaturedImageCaption(e.target.value)}
                            type="text"
                            name="featured_image_caption"
                            value={featuredImageCaption || ""}
                            className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 h-11 px-3 text-sm text-[#111318] dark:text-white"
                            placeholder="Caption for the featured image"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Button 
              type="button"
              onClick={handlePublish}
              disabled={loading}
            >
              {loading && submitAction === "publish" ? "Publishing..." : "Publish Post"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}