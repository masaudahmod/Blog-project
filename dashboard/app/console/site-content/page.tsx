"use client"; // Mark component as client-side
import { useEffect, useMemo, useState } from "react"; // Import React hooks
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Import table UI components
import { Button } from "@/components/ui/button"; // Import button component
import { Input } from "@/components/ui/input"; // Import input component
import { Label } from "@/components/ui/label"; // Import label component
import { toast } from "sonner"; // Import toast notifications
const API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || process.env.NEXT_SERVER_API_URL || ""; // Read public API base URL
const pageOptions = ["home", "blog", "about"]; // Provide common page keys
type SiteContentItem = { // Define site content type
  id: number; // Store row id
  page_key: string; // Store page key
  section_key: string; // Store section key
  content: { title?: string; subtitle?: string; description?: string }; // Store content fields
}; // End type definition
type SiteContentForm = { // Define form state shape
  page_key: string; // Track page key input
  section_key: string; // Track section key input
  title: string; // Track title input
  subtitle: string; // Track subtitle input
  description: string; // Track description input
}; // End form type
const emptyForm: SiteContentForm = { // Define empty form defaults
  page_key: "", // Default page key
  section_key: "", // Default section key
  title: "", // Default title
  subtitle: "", // Default subtitle
  description: "", // Default description
}; // End empty form
export default function Page() { // Export page component
  const [items, setItems] = useState<SiteContentItem[]>([]); // Store site contents list
  const [loading, setLoading] = useState(true); // Track loading state
  const [saving, setSaving] = useState(false); // Track save state
  const [form, setForm] = useState<SiteContentForm>(emptyForm); // Store form values
  const [editingId, setEditingId] = useState<number | null>(null); // Track which item is being edited
  const [error, setError] = useState<string | null>(null); // Track error message
  const canSubmit = useMemo(() => { // Compute form validation state
    return Boolean(form.page_key.trim() && form.section_key.trim() && form.title.trim()); // Require key fields
  }, [form.page_key, form.section_key, form.title]); // Recompute when required fields change
  const fetchContents = async () => { // Define data fetch helper
    if (!API_URL) { // Guard against missing API URL
      setError("Missing API URL. Set NEXT_PUBLIC_SERVER_API_URL."); // Set configuration error
      setLoading(false); // Stop loading state
      return; // Exit early
    } // End guard
    try { // Start safe fetch
      setLoading(true); // Show loading state
      const result = await fetch(`${API_URL}/site-content`, { // Request list endpoint
        method: "GET", // Use GET method
        headers: { "Content-Type": "application/json" }, // Set JSON header
        credentials: "include", // Include cookies for auth
      }); // End fetch call
      const data = await result.json(); // Parse JSON response
      if (!result.ok) { // Handle HTTP errors
        throw new Error(data?.message || "Failed to load site contents"); // Throw meaningful error
      } // End error handling
      setItems(data?.contents || []); // Store content list
      setError(null); // Clear error state
    } catch (err: unknown) { // Handle fetch errors
      const message = err instanceof Error ? err.message : "Failed to load site contents"; // Normalize error message
      setError(message); // Store error message
      toast.error(message); // Show toast error
    } finally { // Always run cleanup
      setLoading(false); // Stop loading state
    } // End cleanup
  }; // End fetchContents
  useEffect(() => { // Fetch data on mount
    fetchContents(); // Load site contents
  }, []); // Run once
  const handleChange = (field: keyof SiteContentForm, value: string) => { // Handle input changes
    setForm((prev) => ({ ...prev, [field]: value })); // Update form state
  }; // End handleChange
  const resetForm = () => { // Reset form to defaults
    setForm(emptyForm); // Reset form state
    setEditingId(null); // Clear edit mode
  }; // End resetForm
  const handleSubmit = async () => { // Handle create/update submit
    if (!canSubmit) { // Validate required fields
      toast.error("Page key, section key, and title are required"); // Show validation error
      return; // Exit early
    } // End validation
    try { // Start safe submit
      setSaving(true); // Set saving state
      const payload = { // Build request payload
        page_key: form.page_key.trim(), // Normalize page key
        section_key: form.section_key.trim(), // Normalize section key
        content: { // Build content object
          title: form.title.trim(), // Normalize title
          subtitle: form.subtitle.trim(), // Normalize subtitle
          description: form.description.trim(), // Normalize description
        }, // End content object
      }; // End payload
      const isEditing = editingId !== null; // Track edit mode
      const result = await fetch( // Send create or update request
        isEditing ? `${API_URL}/site-content/${editingId}` : `${API_URL}/site-content`, // Choose URL
        { // Begin fetch options
          method: isEditing ? "PUT" : "POST", // Choose method
          headers: { "Content-Type": "application/json" }, // Set JSON header
          credentials: "include", // Include cookies for auth
          body: JSON.stringify(payload), // Send payload
        } // End fetch options
      ); // End fetch call
      const data = await result.json(); // Parse response JSON
      if (!result.ok) { // Handle HTTP errors
        throw new Error(data?.message || "Failed to save site content"); // Throw meaningful error
      } // End error handling
      toast.success(isEditing ? "Site content updated" : "Site content created"); // Show success toast
      resetForm(); // Clear form
      await fetchContents(); // Refresh list
    } catch (err: unknown) { // Handle submit errors
      const message = err instanceof Error ? err.message : "Failed to save site content"; // Normalize error message
      toast.error(message); // Show error toast
    } finally { // Always run cleanup
      setSaving(false); // Stop saving state
    } // End cleanup
  }; // End handleSubmit
  const handleEdit = (item: SiteContentItem) => { // Populate form for editing
    setEditingId(item.id); // Set editing id
    setForm({ // Fill form from item
      page_key: item.page_key || "", // Set page key
      section_key: item.section_key || "", // Set section key
      title: item.content?.title || "", // Set title
      subtitle: item.content?.subtitle || "", // Set subtitle
      description: item.content?.description || "", // Set description
    }); // End form fill
  }; // End handleEdit
  const handleDelete = async (item: SiteContentItem) => { // Handle delete action
    const confirmed = window.confirm(`Delete ${item.page_key} / ${item.section_key}?`); // Confirm delete
    if (!confirmed) return; // Exit if not confirmed
    try { // Start safe delete
      const result = await fetch(`${API_URL}/site-content/${item.id}`, { // Send delete request
        method: "DELETE", // Use DELETE method
        headers: { "Content-Type": "application/json" }, // Set JSON header
        credentials: "include", // Include cookies for auth
      }); // End fetch call
      const data = await result.json(); // Parse JSON response
      if (!result.ok) { // Handle HTTP errors
        throw new Error(data?.message || "Failed to delete site content"); // Throw meaningful error
      } // End error handling
      toast.success("Site content deleted"); // Show success toast
      await fetchContents(); // Refresh list
    } catch (err: unknown) { // Handle delete errors
      const message = err instanceof Error ? err.message : "Failed to delete site content"; // Normalize error message
      toast.error(message); // Show error toast
    } // End error handling
  }; // End handleDelete
  return ( // Render page UI
    <div className="p-5 space-y-6">{/* Page container */}
      <div className="flex items-center justify-between">{/* Header row */}
        <h1 className="text-2xl font-bold">Site Content Management</h1>{/* Page title */}
        <Button variant="outline" onClick={fetchContents} disabled={loading}>{/* Refresh button */}
          {loading ? "Refreshing..." : "Refresh"}{/* Refresh label */}
        </Button>{/* End refresh button */}
      </div>{/* End header row */}
      <div className="rounded-lg border p-4 space-y-4">{/* Form card */}
        <h2 className="text-lg font-semibold">{editingId ? "Edit Site Content" : "Create Site Content"}</h2>{/* Form title */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{/* Form grid */}
          <div className="space-y-2">{/* Page key field */}
            <Label htmlFor="page_key">Page Key</Label>{/* Page key label */}
            <Input id="page_key" list="page-options" value={form.page_key} onChange={(e) => handleChange("page_key", e.target.value)} placeholder="home" />{/* Page key input */}
            <datalist id="page-options">{/* Suggest page keys */}
              {pageOptions.map((option) => (
                <option key={option} value={option} />
              ))}{/* End options map */}
            </datalist>{/* End datalist */}
          </div>{/* End page key field */}
          <div className="space-y-2">{/* Section key field */}
            <Label htmlFor="section_key">Section Key</Label>{/* Section key label */}
            <Input id="section_key" value={form.section_key} onChange={(e) => handleChange("section_key", e.target.value)} placeholder="hero" />{/* Section key input */}
          </div>{/* End section key field */}
          <div className="space-y-2">{/* Title field */}
            <Label htmlFor="title">Title</Label>{/* Title label */}
            <Input id="title" value={form.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="Main headline" />{/* Title input */}
          </div>{/* End title field */}
          <div className="space-y-2">{/* Subtitle field */}
            <Label htmlFor="subtitle">Subtitle</Label>{/* Subtitle label */}
            <Input id="subtitle" value={form.subtitle} onChange={(e) => handleChange("subtitle", e.target.value)} placeholder="Short subtitle" />{/* Subtitle input */}
          </div>{/* End subtitle field */}
          <div className="space-y-2 md:col-span-2">{/* Description field */}
            <Label htmlFor="description">Description</Label>{/* Description label */}
            <Input id="description" value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Section description" />{/* Description input */}
          </div>{/* End description field */}
        </div>{/* End form grid */}
        <div className="flex items-center gap-2">{/* Form actions */}
          <Button onClick={handleSubmit} disabled={!canSubmit || saving}>{/* Submit button */}
            {saving ? "Saving..." : editingId ? "Update" : "Create"}{/* Submit label */}
          </Button>{/* End submit button */}
          <Button variant="ghost" onClick={resetForm} disabled={saving}>{/* Reset button */}
            Clear{/* Reset label */}
          </Button>{/* End reset button */}
        </div>{/* End form actions */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}{/* End error message */}
      </div>{/* End form card */}
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
