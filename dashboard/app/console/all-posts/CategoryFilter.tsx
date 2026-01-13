"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Category } from "@/lib/type";
import { X } from "lucide-react";

interface CategoryFilterProps {
  categories: Category[] | null;
  currentCategoryId?: number;
  currentCategorySlug?: string;
  currentFilter: string;
}

export function CategoryFilter({
  categories,
  currentCategoryId,
  currentCategorySlug,
  currentFilter,
}: CategoryFilterProps) {
  const router = useRouter();

  const hasActiveFilters = (currentCategoryId || currentCategorySlug) || currentFilter !== "all";

  const buildUrl = (updates: {
    page?: number;
    categoryId?: number | null;
    categorySlug?: string | null;
    filter?: string;
  }) => {
    const newParams = new URLSearchParams();
    
    // Only add page if it's not 1
    if (updates.page !== undefined && updates.page !== 1) {
      newParams.set("page", updates.page.toString());
    }
    
    // Only add categoryId if it's provided and not null
    if (updates.categoryId !== undefined && updates.categoryId !== null) {
      newParams.set("categoryId", updates.categoryId.toString());
    }
    
    // Only add categorySlug if it's provided and not null
    if (updates.categorySlug !== undefined && updates.categorySlug !== null) {
      newParams.set("categorySlug", updates.categorySlug);
    }
    
    // Only add filter if it's not "all"
    if (updates.filter && updates.filter !== "all") {
      newParams.set("filter", updates.filter);
    }
    
    const queryString = newParams.toString();
    return queryString ? `?${queryString}` : "";
  };

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      // Clear category filter, keep status filter if it's not "all"
      router.push(buildUrl({ 
        page: 1, 
        categoryId: null,
        categorySlug: null,
        filter: currentFilter !== "all" ? currentFilter : undefined 
      }));
    } else {
      const id = Number(value);
      if (!isNaN(id)) {
        router.push(buildUrl({ 
          page: 1, 
          categoryId: id, 
          categorySlug: null,
          filter: currentFilter !== "all" ? currentFilter : undefined 
        }));
      } else {
        router.push(buildUrl({ 
          page: 1, 
          categoryId: null,
          categorySlug: value, 
          filter: currentFilter !== "all" ? currentFilter : undefined 
        }));
      }
    }
  };

  const handleStatusChange = (value: string) => {
    const updates = {
      page: 1,
      filter: value !== "all" ? value : undefined,
      categoryId: currentCategoryId || null,
      categorySlug: currentCategorySlug || null,
    };
    router.push(buildUrl(updates));
  };

  const handleClearFilters = () => {
    // Clear all filters and reset to page 1
    router.push("/console/all-posts");
  };

  return (
    <div className="flex gap-2 items-center">
      <Select
        value={currentCategoryId?.toString() || currentCategorySlug || "all"}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories?.map((category: Category) => (
            <SelectItem key={category.id} value={category.id.toString()}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentFilter} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Filter status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Posts</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
          className="h-9 px-3"
          title="Clear all filters"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
