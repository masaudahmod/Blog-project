import { MetadataRoute } from "next";
import { PostType } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // 🔹 Backend API থেকে সব blog slug আনো
  const res = await fetch(`${process.env.NEXT_SERVER_API_URL}/api/post`, {
    cache: "no-store",
  });
  const blogs = await res.json();

  const blogUrls = blogs.map((blog: PostType) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.updated_at || blog.created_at || ""),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
    },
    ...blogUrls,
  ];
}
