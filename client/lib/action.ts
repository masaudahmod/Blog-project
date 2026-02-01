"use server";

/**
 * Client-side API actions for the public blog
 */

const API_URL = process.env.NEXT_SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL; // Resolve API base URL

/**
 * Get site content by page key
 */
export async function getSiteContentByPageKey(pageKey: string) { // Fetch CMS content for a page
  try { // Start safe request
    const result = await fetch(`${API_URL}/site-content/page/${pageKey}`, { // Call site content endpoint
      method: "GET", // Use GET method
      headers: { // Set request headers
        "Content-Type": "application/json", // Declare JSON
      }, // End headers
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    }); // End fetch call
    const data = await result.json(); // Parse response JSON
    if (result.ok) { // Check for success
      return data; // Return API payload
    } // End success check
    console.error("Error fetching site content:", data?.message || "Unknown error"); // Log error
    return null; // Return null on failure
  } catch (error) { // Handle network errors
    console.error("Error fetching site content:", error); // Log error
    return null; // Return null on failure
  } // End error handling
} // End getSiteContentByPageKey

/**
 * Get all posts with pagination
 */
export async function getAllPosts(page = 1, filter: "all" | "published" | "draft" = "all") {
  try {
    const result = await fetch(`${API_URL}/post?page=${page}&filter=${filter}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });
    const data = await result.json();
    if (result.ok) {
      return data;
    } else {
      console.error("Error fetching posts");
      return { posts: [], currentPage: 1, totalPages: 1 };
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], currentPage: 1, totalPages: 1 };
  }
}

/**
 * Get a post by id
 */
export async function getPostById(id: number) {
  try {
    const result = await fetch(`${API_URL}/post/id/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });
    const { post } = await result.json();
    if (result.ok) {
      return post;
    } else {
      console.error("Error fetching post by id");
      return null;
    }
  } catch (error) {
    console.error("Error fetching post by id:", error);
    return null;
  }
}

/**
 * Get posts by category (id or slug)
 */
export async function getPostsByCategory({
  categoryId,
  categorySlug,
  page = 1,
  limit = 10,
  filter = "published",
  includeStats = false,
}: {
  categoryId?: number;
  categorySlug?: string;
  page?: number;
  limit?: number;
  filter?: "all" | "published" | "draft";
  includeStats?: boolean;
}) {
  try {
    const params = new URLSearchParams();
    if (categoryId !== undefined) params.set("categoryId", String(categoryId));
    if (categorySlug) params.set("categorySlug", categorySlug);
    params.set("page", String(page));
    params.set("limit", String(limit));
    params.set("filter", filter);
    params.set("includeStats", includeStats ? "true" : "false");

    const result = await fetch(`${API_URL}/post/filter?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });
    const data = await result.json();
    if (result.ok) {
      return data;
    }
    console.error("Error fetching posts by category");
    return { posts: [], pagination: { currentPage: 1, totalPages: 1 }, category: null };
  } catch (error) {
    console.error("Error fetching posts by category:", error);
    return { posts: [], pagination: { currentPage: 1, totalPages: 1 }, category: null };
  }
}

/**
 * Get a post by slug
 */
export async function getPostBySlug(slug: string) {
  try {
    const result = await fetch(`${API_URL}/post/slug/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });
    const { post } = await result.json();
    if (result.ok) {
      return post;
    } else {
      console.error("Error fetching post by slug");
      return null;
    }
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return null;
  }
}

/**
 * Get approved comments for a post
 */
export async function getPostComments(postId: number) {
  try {
    const result = await fetch(`${API_URL}/comments/post/${postId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });
    const data = await result.json();
    if (result.ok) {
      return data.comments || [];
    } else {
      console.error("Error fetching comments");
      return [];
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

/**
 * Add a comment to a post (top-level or reply)
 * Optional: parent_id (reply to comment), user_name (display name for this comment)
 */
export async function addComment({
  post_id,
  user_identifier,
  message,
  parent_id,
  user_name,
}: {
  post_id: number;
  user_identifier: string;
  message: string;
  parent_id?: number | null;
  user_name?: string | null;
}) {
  try {
    const body: Record<string, unknown> = { post_id, user_identifier, message };
    if (parent_id != null && parent_id > 0) body.parent_id = parent_id;
    if (user_name != null && String(user_name).trim()) body.user_name = String(user_name).trim();
    const result = await fetch(`${API_URL}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, message: "Failed to add comment" };
  }
}

/**
 * Add a comment to a post (legacy route)
 */
export async function addPostComment({
  post_id,
  user_identifier,
  message,
}: {
  post_id: number;
  user_identifier: string;
  message: string;
}) {
  try {
    const result = await fetch(`${API_URL}/post/comment/${post_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ post_id, user_identifier, message }),
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.error("Error adding comment via post route:", error);
    return { success: false, message: "Failed to add comment" };
  }
}

/**
 * Like a post
 */
export async function likePost({
  post_id,
  user_identifier,
}: {
  post_id: number;
  user_identifier: string;
}) {
  try {
    const result = await fetch(`${API_URL}/likes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ post_id, user_identifier }),
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.error("Error liking post:", error);
    return { success: false, message: "Failed to like post" };
  }
}

/**
 * Like a post by slug (legacy route)
 */
export async function likePostBySlug(slug: string) {
  try {
    const result = await fetch(`${API_URL}/post/${slug}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.error("Error liking post by slug:", error);
    return { success: false, message: "Failed to like post" };
  }
}

/**
 * Unlike a post
 */
export async function unlikePost({
  post_id,
  user_identifier,
}: {
  post_id: number;
  user_identifier: string;
}) {
  try {
    const result = await fetch(`${API_URL}/likes`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ post_id, user_identifier }),
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.error("Error unliking post:", error);
    return { success: false, message: "Failed to unlike post" };
  }
}

/**
 * Unlike a post by slug (legacy route)
 */
export async function unlikePostBySlug(slug: string) {
  try {
    const result = await fetch(`${API_URL}/post/${slug}/unlike`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.error("Error unliking post by slug:", error);
    return { success: false, message: "Failed to unlike post" };
  }
}

/**
 * Check if user has liked a post
 */
export async function checkLikeStatus({
  post_id,
  user_identifier,
}: {
  post_id: number;
  user_identifier: string;
}) {
  try {
    const result = await fetch(
      `${API_URL}/likes/check?post_id=${post_id}&user_identifier=${user_identifier}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
      }
    );
    const data = await result.json();
    if (result.ok) {
      return data.liked || false;
    }
    return false;
  } catch (error) {
    console.error("Error checking like status:", error);
    return false;
  }
}

/**
 * Get like count for a post
 */
export async function getLikeCount(postId: number) {
  try {
    const result = await fetch(`${API_URL}/likes/count/${postId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });
    const data = await result.json();
    if (result.ok) {
      return data.count || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error getting like count:", error);
    return 0;
  }
}

/**
 * Get all categories
 * @param withCount - when true, returns categories with post_count (published posts per category)
 */
export async function getCategories(options?: { withCount?: boolean }) {
  try {
    const params = new URLSearchParams();
    if (options?.withCount) params.set("withCount", "true");
    const url = `${API_URL}/category${params.toString() ? `?${params.toString()}` : ""}`;
    const result = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });
    const data = await result.json();
    if (result.ok) {
      return data.categories || [];
    }
    console.error("Error fetching categories");
    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * Get category by id
 */
export async function getCategoryById(id: number) {
  try {
    const result = await fetch(`${API_URL}/category/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });
    const data = await result.json();
    if (result.ok) {
      return data.category || null;
    }
    console.error("Error fetching category by id");
    return null;
  } catch (error) {
    console.error("Error fetching category by id:", error);
    return null;
  }
}

/**
 * Log user activity
 */
export async function logActivity({
  post_id,
  user_identifier,
  action_type,
  device_info,
}: {
  post_id: number;
  user_identifier: string;
  action_type: "like" | "comment" | "view";
  device_info?: string;
}) {
  try {
    await fetch(`${API_URL}/activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ post_id, user_identifier, action_type, device_info }),
    });
    // Don't wait for response, just fire and forget
    return { success: true };
  } catch {
    // Silently fail - activity logging is not critical
    return { success: false };
  }
}

/**
 * Newsletter subscription
 */
export async function newsletterSubscribe({ email }: { email: string }) {
  try {
    const result = await fetch(`${API_URL}/newsletter-subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return { success: false, message: "Failed to subscribe" };
  }
}

/**
 * Newsletter unsubscribe
 */
export async function newsletterUnsubscribe({ email }: { email: string }) {
  try {
    const result = await fetch(`${API_URL}/newsletter-unsubscribe`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.error("Error unsubscribing from newsletter:", error);
    return { success: false, message: "Failed to unsubscribe" };
  }
}

// get pinned posts
export async function getPinnedPosts() {
  try {
    const result = await fetch(`${API_URL}/post/pinned`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });
    const data = await result.json();
    if (result.ok) {
      return data;
    }
    console.error("Error getting pinned posts");
    return [];
  } catch (error) {
    console.error("Error getting pinned posts:", error);
    return [];
  }
}

/**
 * Get trending posts (recent published, for sidebar "Trending Now")
 */
export async function getTrendingPosts(limit = 5) {
  try {
    const result = await fetch(`${API_URL}/post/trending?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });
    const data = await result.json();
    if (result.ok && data?.posts) {
      return { posts: data.posts };
    }
    return { posts: [] };
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    return { posts: [] };
  }
}