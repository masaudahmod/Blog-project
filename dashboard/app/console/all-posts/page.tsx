import { Button } from "@/components/ui/button";
import { getAllPosts } from "@/lib/action";
import { PostType } from "@/lib/type";
import Image from "next/image";
import Link from "next/link";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const data = await getAllPosts(currentPage);
  const posts = data?.posts;
  const totalPages = data?.totalPages;
  return (
    <>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">
          All Recent Posts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-5">
          {posts?.map((post: PostType) => (
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
                <Link href={`?page=${currentPage - 1}`}>Previous</Link>
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
                <Link href={`?page=${currentPage + 1}`}>Next</Link>
              ) : (
                <span>Next</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
