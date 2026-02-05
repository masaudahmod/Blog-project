"use client";
import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import { X } from "lucide-react";
import {
  createSiteContent,
  deleteSiteContent,
  getSiteContents,
  updateSiteContent,
} from "@/lib/action";

const PAGE_OPTIONS = [
  { value: "home", label: "home" },
  { value: "blog", label: "blog" },
  { value: "about", label: "about" },
] as const;

/** Section key options per page (must match server ALLOWED_SECTIONS_BY_PAGE) */
const SECTION_OPTIONS_BY_PAGE: Record<string, { value: string; label: string }[]> = {
  home: [
    { value: "latest", label: "latest" },
    { value: "daily-middle-ad", label: "daily-middle-ad" },
    { value: "ad", label: "ad" },
    { value: "ad-2", label: "ad-2" },
    { value: "ad-3", label: "ad-3" },
    { value: "trending", label: "trending" },
    { value: "hero", label: "hero" },
    { value: "footer", label: "footer" },
    { value: "newsletter", label: "newsletter" },
    { value: "side-article", label: "side-article" },
  ],
  blog: [
    { value: "header", label: "header" },
    { value: "latest", label: "latest" },
    { value: "newsletter", label: "newsletter" },
    { value: "search", label: "search" },
  ],
  about: [
    { value: "hero", label: "hero" },
    { value: "author", label: "author" },
    { value: "explore", label: "explore" },
    { value: "mission", label: "mission" },
    { value: "vision", label: "vision" },
    { value: "cta", label: "cta" },
  ],
};

/** Sections that show Link input (subtitle button href) for advertisement */
const SECTIONS_WITH_LINK = ["daily-middle-ad", "ad", "ad-2", "ad-3"] as const;
function sectionHasLink(sectionKey: string): boolean {
  return (SECTIONS_WITH_LINK as readonly string[]).includes(sectionKey);
}

function getSectionOptionsForPage(pageKey: string): { value: string; label: string }[] {
  return SECTION_OPTIONS_BY_PAGE[pageKey] ?? [];
}

type SiteContentItem = {
  id: number;
  page_key: string;
  section_key: string;
  content: { title?: string; subtitle?: string; description?: string; link?: string };
  image_url?: string;
  image_public_id?: string;
};
type SiteContentForm = {
  page_key: string;
  section_key: string;
  title: string;
  subtitle: string;
  description: string;
  link: string;
};
const emptyForm: SiteContentForm = {
  page_key: "",
  section_key: "",
  title: "",
  subtitle: "",
  description: "",
  link: "",
};
export default function Page() {
  const [items, setItems] = useState<SiteContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SiteContentForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // Store selected image file
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Store preview URL
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null); // Store existing image URL when editing
  const [imageRemoved, setImageRemoved] = useState(false); // Track if user removed image
  const canSubmit = useMemo(() => {
    return Boolean(form.page_key.trim() && form.section_key.trim() && form.title.trim());
  }, [form.page_key, form.section_key, form.title]);
  const fetchContents = async () => {
    try {
      setLoading(true);
      const result = await getSiteContents();
      if (!result.ok) {
        throw new Error(result.message || "Failed to load site contents");
      }
      setItems(result.contents);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load site contents";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchContents();
  }, []);
  const handleChange = (field: keyof SiteContentForm, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "page_key") {
        const allowed = getSectionOptionsForPage(value).map((o) => o.value);
        if (prev.section_key && !allowed.includes(prev.section_key)) {
          next.section_key = "";
        }
      }
      return next;
    });
  };
  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null); // Clear image file
    setImagePreview(null); // Clear preview
    setExistingImageUrl(null); // Clear existing image
    setImageRemoved(false); // Reset removal flag
  };
  
  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Get selected file
    if (file) {
      setImageFile(file); // Store file
      setImageRemoved(false); // Reset removal flag when new image is selected
      // Create preview URL
      const reader = new FileReader(); // Create file reader
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Set preview URL
      };
      reader.readAsDataURL(file); // Read file as data URL
    }
  };
  
  // Handle image removal
  const handleRemoveImage = () => {
    setImageFile(null); // Clear file
    setImagePreview(null); // Clear preview
    setImageRemoved(true); // Mark as removed
    if (existingImageUrl) {
      setExistingImageUrl(null); // Clear existing image URL
    }
  };
  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error("Page key, section key, and title are required");
      return;
    }
    try {
      setSaving(true);
      
      // Create FormData to support file upload
      const formData = new FormData(); // Create FormData object
      formData.append("page_key", form.page_key.trim()); // Add page key
      formData.append("section_key", form.section_key.trim()); // Add section key
      const content: Record<string, string> = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
      };
      if (sectionHasLink(form.section_key) && form.link.trim()) {
        content.link = form.link.trim();
      }
      formData.append("content", JSON.stringify(content));
      
      // Handle image upload
      if (imageFile) {
        formData.append("image", imageFile); // Add image file
      } else if (imageRemoved) {
        formData.append("remove_image", "true"); // Mark image for removal
      }
      
      const isEditing = editingId !== null;
      const result = isEditing
        ? await updateSiteContent(editingId, formData) // Pass FormData for update
        : await createSiteContent(formData); // Pass FormData for create
      if (!result.ok) {
        throw new Error(result.message || "Failed to save site content");
      }
      toast.success(isEditing ? "Site content updated" : "Site content created");
      resetForm();
      window.location.reload();
      await fetchContents();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save site content";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };
  const handleEdit = (item: SiteContentItem) => {
    setEditingId(item.id);
    setForm({
      page_key: item.page_key || "",
      section_key: item.section_key || "",
      title: item.content?.title || "",
      subtitle: item.content?.subtitle || "",
      description: item.content?.description || "",
      link: item.content?.link || "",
    });
    // Load existing image if available
    if (item.image_url) {
      setExistingImageUrl(item.image_url); // Set existing image URL
      setImagePreview(item.image_url); // Set preview to existing image
    } else {
      setExistingImageUrl(null); // Clear existing image
      setImagePreview(null); // Clear preview
    }
    setImageFile(null); // Clear new file selection
    setImageRemoved(false); // Reset removal flag
  };
  const handleDelete = async (item: SiteContentItem) => {
    const confirmed = window.confirm(`Delete ${item.page_key} / ${item.section_key}?`);
    if (!confirmed) return;
    try {
      const result = await deleteSiteContent(item.id);
      if (!result.ok) {
        throw new Error(result.message || "Failed to delete site content");
      }
      toast.success("Site content deleted");
      await fetchContents();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete site content";
      toast.error(message);
    }
  };
  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Site Content Management</h1>
        <Button variant="outline" onClick={fetchContents} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <div className="rounded-lg border p-4 space-y-4">
        <h2 className="text-lg font-semibold">{editingId ? "Edit Site Content" : "Create Site Content"}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="page_key">Page Key</Label>
            <Select
              value={form.page_key || undefined}
              onValueChange={(value) => handleChange("page_key", value)}
            >
              <SelectTrigger id="page_key" className="w-full">
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="section_key">Section Key</Label>
            <Select
              value={form.section_key || undefined}
              onValueChange={(value) => handleChange("section_key", value)}
              disabled={!form.page_key}
            >
              <SelectTrigger id="section_key" className="w-full">
                <SelectValue placeholder={form.page_key ? "Select section" : "Select page first"} />
              </SelectTrigger>
              <SelectContent>
                {getSectionOptionsForPage(form.page_key).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="Main headline" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input id="subtitle" value={form.subtitle} onChange={(e) => handleChange("subtitle", e.target.value)} placeholder="Short subtitle" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Section description" />
          </div>
          {sectionHasLink(form.section_key) && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="link">Link (subtitle button href for advertisement)</Label>
              <Input
                id="link"
                type="url"
                value={form.link}
                onChange={(e) => handleChange("link", e.target.value)}
                placeholder="https://example.com or /page"
              />
            </div>
          )}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="image">Image (Optional)</Label>
            <Input 
              id="image" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            {/* Show image preview or existing image */}
            {(imagePreview || existingImageUrl) && !imageRemoved && (
              <div className="relative mt-2 w-full max-w-md">
                <div className="relative h-48 w-full rounded-lg overflow-hidden border">
                  <Image
                    src={imagePreview || existingImageUrl || ""}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSubmit} disabled={!canSubmit || saving}>
            {saving ? "Saving..." : editingId ? "Update" : "Create"}
          </Button>
          <Button variant="ghost" onClick={resetForm} disabled={saving}>
            Clear
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Loading site contents...
                </TableCell>
              </TableRow>
            )}
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                  No site content found
                </TableCell>
              </TableRow>
            )}
            {!loading && items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.page_key}</TableCell>
                <TableCell>{item.section_key}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{item.content?.title || "-"}</span>
                    {item.image_url && (
                      <span className="text-xs text-blue-600">📷</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
