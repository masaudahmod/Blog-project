import { Button } from "@/components/ui/button";
import { getAllPosts, getPostsByCategory, getAllCategories } from "@/lib/action";
import { PostType, Category } from "@/lib/type";
import Image from "next/image";
import Link from "next/link";
import { CategoryFilter } from "./CategoryFilter";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoryId?: string; categorySlug?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const categoryId = params.categoryId ? Number(params.categoryId) : undefined;
  const categorySlug = params.categorySlug;
  const statusFilter = params.filter || "all";

  // Fetch categories for the filter dropdown
  const categories = await getAllCategories();

  // Fetch posts - either filtered by category or all posts
  let data;
  let posts: PostType[] = [];
  let totalPages = 1;
  let currentCategory: Category | null = null;

  if (categoryId || categorySlug) {
    // Fetch filtered posts by category
    const filteredData = await getPostsByCategory({
      categoryId,
      categorySlug,
      page: currentPage,
      limit: 10,
      filter: statusFilter as "all" | "published" | "draft",
    });
    if (filteredData.success) {
      posts = filteredData.posts || [];
      totalPages = filteredData.pagination?.totalPages || 1;
      currentCategory = filteredData.category || null;
    } else {
      // Handle case where category exists but has no posts
      posts = [];
      totalPages = 1;
      // Try to get category info even if no posts
      if (filteredData.category) {
        currentCategory = filteredData.category;
      }
    }
  } else {
    // Fetch all posts
    data = await getAllPosts(currentPage, statusFilter);
    posts = data?.posts || [];
    totalPages = data?.totalPages || 1;
  }
  // Build URL with query parameters
  const buildUrl = (updates: {
    page?: number;
    categoryId?: number | null;
    categorySlug?: string | null;
    filter?: string;
  }) => {
    const newParams = new URLSearchParams();
    
    // Only add page if it's not 1
    if (updates.page !== undefined && updates.page !== 1) {
      newParams.set("page", String(updates.page));
    }
    
    // Only add categoryId if it's provided and not null
    if (updates.categoryId !== undefined && updates.categoryId !== null) {
      newParams.set("categoryId", String(updates.categoryId));
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

  return (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {currentCategory ? `${currentCategory.name} Posts` : "All Recent Posts"}
          </h2>
          
          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            currentCategoryId={categoryId}
            currentCategorySlug={categorySlug}
            currentFilter={statusFilter}
          />
        </div>
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-5">
            {posts.map((post: PostType) => (
            <div
              key={post.id}
              className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition"
            >
              {/* Image */}
              <div className="relative w-full h-48">
                <Image
                  src={post.featured_image_url || "/placeholder.png"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-4 space-y-2">
                {/* Title */}
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}

                {/* Meta Info */}
                <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                  <p>
                    <span className="font-medium">Category:</span>{" "}
                    {post.category?.name || "Uncategorized"}
                  </p>

                  <p>
                    <span className="font-medium">Published:</span>{" "}
                    {post.is_published ? "Yes" : "No"}
                  </p>

                  <p>
                    <span className="font-medium">Read Time:</span>{" "}
                    {post.read_time} min
                  </p>
                  <p>
                    <span className="font-bold text-white">Meta Keywords:</span>{" "}
                    {post?.meta_keywords?.map((keyword) => keyword)}
                  </p>
                  <p>
                    <span className="font-bold text-white">Meta tags:</span>{" "}
                    {post.tags?.map((tag) => tag).join(", ")}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500">
                    {new Date(post?.created_at || "").toLocaleDateString()}
                  </span>

                  <Link
                    href={`/console/posts/${post.slug}`}
                    className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
                  >
                    View Post
                  </Link>
                </div>
              </div>
            </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 my-5">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                No Posts Available
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                {currentCategory
                  ? `There are no posts in the "${currentCategory.name}" category yet.`
                  : "There are no posts available at the moment."}
              </p>
            </div>
          </div>
        )}
        {posts && posts.length > 0 && (
          <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            {/* Previous Button */}
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              asChild={currentPage > 1}
            >
              {currentPage > 1 ? (
                <Link
                  href={buildUrl({
                    page: currentPage - 1,
                    categoryId,
                    categorySlug,
                    filter: statusFilter,
                  })}
                >
                  Previous
                </Link>
              ) : (
                <span>Previous</span>
              )}
            </Button>

            {/* Next Button */}
            <Button
              variant="outline"
              disabled={currentPage >= totalPages}
              asChild={currentPage < totalPages}
            >
              {currentPage < totalPages ? (
                <Link
                  href={buildUrl({
                    page: currentPage + 1,
                    categoryId,
                    categorySlug,
                    filter: statusFilter,
                  })}
                >
                  Next
                </Link>
              ) : (
                <span>Next</span>
              )}
            </Button>
          </div>
        </div>
        )}
      </div>
    </>
  );
}
