"use client";
import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  createSiteContent,
  deleteSiteContent,
  getSiteContents,
  updateSiteContent,
} from "@/lib/action";
import { SiteContentPayload } from "@/lib/type";
const pageOptions = ["home", "blog", "about"];
type SiteContentItem = {
  id: number;
  page_key: string;
  section_key: string;
  content: { title?: string; subtitle?: string; description?: string };
};
type SiteContentForm = {
  page_key: string;
  section_key: string;
  title: string;
  subtitle: string;
  description: string;
};
const emptyForm: SiteContentForm = {
  page_key: "",
  section_key: "",
  title: "",
  subtitle: "",
  description: "",
};
export default function Page() {
  const [items, setItems] = useState<SiteContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SiteContentForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };
  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error("Page key, section key, and title are required");
      return;
    }
    try {
      setSaving(true);
      const payload: SiteContentPayload = {
        page_key: form.page_key.trim(),
        section_key: form.section_key.trim(),
        content: {
          title: form.title.trim(),
          subtitle: form.subtitle.trim(),
          description: form.description.trim(),
        },
      };
      const isEditing = editingId !== null;
      const result = isEditing
        ? await updateSiteContent(editingId, payload)
        : await createSiteContent(payload);
      if (!result.ok) {
        throw new Error(result.message || "Failed to save site content");
      }
      toast.success(isEditing ? "Site content updated" : "Site content created");
      resetForm();
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
    });
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
            <Input id="page_key" list="page-options" value={form.page_key} onChange={(e) => handleChange("page_key", e.target.value)} placeholder="home" />
            <datalist id="page-options">
              {pageOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div className="space-y-2">
            <Label htmlFor="section_key">Section Key</Label>
            <Input id="section_key" value={form.section_key} onChange={(e) => handleChange("section_key", e.target.value)} placeholder="hero" />
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
                <TableCell>{item.content?.title || "-"}</TableCell>
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
