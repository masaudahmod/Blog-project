"use server";

/**
 * Client-side API actions for the public blog
 */

const API_URL = process.env.NEXT_SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL;

/**
 * Get all posts with pagination
 */
export async function getAllPosts(page = 1) {
  try {
    const result = await fetch(`${API_URL}/post?page=${page}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
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
 * Get a post by slug
 */
export async function getPostBySlug(slug: string) {
  try {
    const result = await fetch(`${API_URL}/post/slug/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
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
      cache: "no-store",
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
 * Add a comment to a post
 */
export async function addComment({
  post_id,
  user_identifier,
  message,
}: {
  post_id: number;
  user_identifier: string;
  message: string;
}) {
  try {
    const result = await fetch(`${API_URL}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ post_id, user_identifier, message }),
    });
    const data = await result.json();
    return data;
  } catch (error) {
    console.error("Error adding comment:", error);
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
        cache: "no-store",
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
      cache: "no-store",
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
    const result = await fetch(`${API_URL}/activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ post_id, user_identifier, action_type, device_info }),
    });
    // Don't wait for response, just fire and forget
    return { success: true };
  } catch (error) {
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
