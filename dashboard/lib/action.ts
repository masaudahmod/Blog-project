"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function getCookies() {
  try {
    const myCookies = await cookies();
    const token = myCookies.get("token");
    if (token) {
      return token.value;
    }
    return null;
  } catch (error) {
    console.error("Error fetching cookies:", error);
  }
}

async function login(formdata: FormData) {
  try {
    const email = formdata.get("email");
    const password = formdata.get("password");
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
        body: JSON.stringify({ email, password }),
      }
    );
    const data = await result.json();
    if (!result.ok) {
      return { ok: false, message: data.message || "Login failed" };
    }
    if (data.token) {
      const cookieStore = await cookies();
      cookieStore.set("token", data.token, {
        httpOnly: true,
        path: "/",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      console.log("Token cookie set successfully");
      // redirect("/console");
    }
    return { ok: true, message: "Login successful" };
  } catch (error) {
    return { ok: false, error: "Login failed" };
  }
}

async function registerUser(formdata: FormData) {
  try {
    const data = Object.fromEntries(formdata);
    const response = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/auth/register-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    console.log("result", result);
    if (!response.ok) {
      return { ok: false, message: result.message || "Registration failed" };
    }

    return result;
  } catch (error) {
    console.error("Error registering user:", error);
  }
}

async function getAllPosts(page = 1, filter = "all") {
  try {
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/post?page=${page}&filter=${filter}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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
 * Get posts filtered by category with pagination
 * @param categoryId - Category ID (optional if categorySlug is provided)
 * @param categorySlug - Category slug (optional if categoryId is provided)
 * @param page - Page number (default: 1)
 * @param limit - Posts per page (default: 10, max: 50)
 * @param filter - Post status filter: 'all', 'published', 'draft' (default: 'all')
 * @param includeStats - Include category statistics (default: false)
 * @returns Promise with posts, pagination info, and optional category stats
 */
async function getPostsByCategory({
  categoryId,
  categorySlug,
  page = 1,
  limit = 10,
  filter = "all",
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
    if (!categoryId && !categorySlug) {
      console.error("Either categoryId or categorySlug must be provided");
      return {
        success: false,
        posts: [],
        pagination: { currentPage: 1, totalPages: 1, totalPosts: 0 },
        category: null,
      };
    }

    const params = new URLSearchParams();
    if (categoryId) params.append("categoryId", categoryId.toString());
    if (categorySlug) params.append("categorySlug", categorySlug);
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    params.append("filter", filter);
    if (includeStats) params.append("includeStats", "true");

    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/post/filter?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Ensure fresh data for filtering
      }
    );

    const data = await result.json();

    if (result.ok) {
      return {
        success: true,
        ...data,
      };
    } else {
      // Don't log errors for empty results (404) - this is a valid state
      // Only log actual server errors (500, etc.)
      if (result.status >= 500) {
        console.error("Error fetching filtered posts:", data.message);
      }
      
      // If category not found (404), return empty but with category info if available
      if (result.status === 404) {
        return {
          success: false,
          message: data.message || "Category not found",
          posts: [],
          pagination: { currentPage: 1, totalPages: 1, totalPosts: 0 },
          category: null,
        };
      }
      
      return {
        success: false,
        message: data.message || "Failed to fetch filtered posts",
        posts: [],
        pagination: { currentPage: 1, totalPages: 1, totalPosts: 0 },
        category: null,
      };
    }
  } catch (error) {
    console.error("Error fetching filtered posts:", error);
    return {
      success: false,
      message: "Network error while fetching posts",
      posts: [],
      pagination: { currentPage: 1, totalPages: 1, totalPosts: 0 },
      category: null,
    };
  }
}

async function updatePostPublishStatus(postId: number, isPublished: boolean) {
  try {
    const token = await getCookies();
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/post/${postId}/publish`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_published: isPublished }),
      }
    );
    const data = await result.json();
    if (result.ok) {
      return { success: true, data };
    } else {
      return { success: false, message: data.message || "Failed to update publish status" };
    }
  } catch (error) {
    console.error("Error updating publish status:", error);
    return { success: false, message: "Failed to update publish status" };
  }
}

async function getAllPostComments(postId: number) {
  try {
    const token = await getCookies();
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/comments/post/${postId}/all`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await result.json();
    if (result.ok) {
      return data;
    } else {
      console.error("Error fetching post comments");
      return { comments: [], count: 0 };
    }
  } catch (error) {
    console.error("Error fetching post comments:", error);
    return { comments: [], count: 0 };
  }
}

async function getCurrentUser() {
  try {
    const token = await getCookies();
    const result = await fetch(`${process.env.NEXT_SERVER_API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const { user } = await result.json();
    if (result.ok) {
      return user;
    } else {
      console.error("Error fetching user");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

async function getPendingUser() {
  try {
    const token = await getCookies();
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/auth/pending-user`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await result.json();
    if (result.ok) {
      return data;
    } else {
      console.error("Error fetching pending user");
    }
  } catch (error) {
    console.error("Error fetching pending user:", error);
  }
}

async function activateUser(id: number) {
  try {
    const token = await getCookies();
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/auth/pending-user/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await result.json();
    if (result.ok) {
      return data;
    } else {
      console.error("Error activating pending user");
    }
    revalidatePath("/console/pending-user");
  } catch (error) {
    console.error("Error activating pending user:", error);
  }
}

async function deleteUser(id: number) {
  try {
    const token = await getCookies();
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/auth/pending-user/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await result.json();
    if (result.ok) {
      return data;
    } else {
      console.error("Error deleting user");
    }
    revalidatePath("/console/pending-user");
  } catch (error) {
    console.error("Error deleting user:", error);
  }
}

async function logoutUser() {
  try {
    const token = await getCookies();
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/auth/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (result.ok) {
      const cookieStore = await cookies();
      cookieStore.delete("token");
      console.log("User logged out successfully");
    } else {
      console.error("Error logging out user");
    }
  } catch (error) {
    console.error("Error logging out user:", error);
  }
}

async function addCategory(formdata: FormData) {
  try {
    const token = await getCookies();
    const jsonFile = JSON.stringify(Object.fromEntries(formdata));
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/category/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: jsonFile,
      }
    );
    const data = await result.json();
    if (result.ok) {
      return { ok: true, data: data.category };
    } else {
      return { ok: false, message: "Adding category failed" };
    }
  } catch (error) {
    console.log(error);
    return { ok: false, error: "Adding category failed" };
  }
}

async function deleteCategory(categoryId: number) {
  try {
    const token = await getCookies();
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/category/${categoryId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (result.ok) {
      return { ok: true, message: "Category deleted" };
    } else {
      return { ok: false, message: "Deleting category failed" };
    }
  } catch (error) {
    console.log(error);
    return { ok: false, error: "Deleting category failed" };
  }
}

async function getAllCategories() {
  try {
    const result = await fetch(`${process.env.NEXT_SERVER_API_URL}/category`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { categories } = await result.json();
    if (result.ok) {
      return categories;
    } else {
      console.error("Error fetching categories");
      return null;
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return null;
  }
}

async function getCategorybyId(categoryId: number) {
  try {
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/category/${categoryId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const { category } = await result.json();
    if (result.ok) {
      return category;
    } else {
      console.error("Error fetching category");
      return null;
    }
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

async function addPost(formdata: FormData) {
  try {
    const token = await getCookies();
    const result = await fetch(`${process.env.NEXT_SERVER_API_URL}/post/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
    });
    const data = await result.json();
    return {
      ok: result.ok,
      message: data.message,
      data: data,
    };
  } catch (error) {
    console.log("error addpost", error);
    return;
  }
}

async function deletePost(postId: number) {
  try {
    const token = await getCookies();
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/post/id/${postId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (result.ok) {
      return { ok: true, message: "Post deleted" };
    } else {
      return { ok: false, message: "Deleting post failed" };
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    return { ok: false, error: "Deleting post failed" };
  }
}

async function getPostBySlug(slug: string) {
  try {
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/post/slug/${slug}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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

// Legacy comment function - kept for backward compatibility
async function addComment({
  id,
  userName,
  message,
}: {
  id: number | string;
  userName: string;
  message: string;
}) {
  try {
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/post/comment/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, message }),
      }
    );
    revalidatePath("/");
    return result.json();
  } catch (error) {
    console.error("Error adding comment:", error);
    return null;
  }
}

// New comment functions using the normalized table
async function getComments(status?: string) {
  try {
    const token = await getCookies();
    const url = status
      ? `${process.env.NEXT_SERVER_API_URL}/comments?status=${status}`
      : `${process.env.NEXT_SERVER_API_URL}/comments`;
    const result = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await result.json();
    if (result.ok) {
      return data;
    } else {
      console.error("Error fetching comments");
      return { comments: [], count: 0 };
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    return { comments: [], count: 0 };
  }
}

async function updateCommentStatus(commentId: number, status: string) {
  try {
    const token = await getCookies();
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/comments/${commentId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );
    const data = await result.json();
    revalidatePath("/console");
    return data;
  } catch (error) {
    console.error("Error updating comment:", error);
    return { success: false, message: "Failed to update comment" };
  }
}

async function updateCommentMessage(commentId: number, message: string) {
  try {
    const token = await getCookies();
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/comments/${commentId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      }
    );
    const data = await result.json();
    revalidatePath("/console");
    return data;
  } catch (error) {
    console.error("Error updating comment:", error);
    return { success: false, message: "Failed to update comment" };
  }
}

async function deleteCommentById(commentId: number) {
  try {
    const token = await getCookies();
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await result.json();
    revalidatePath("/console");
    return data;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, message: "Failed to delete comment" };
  }
}

async function getPendingComments() {
  try {
    const token = await getCookies();
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/post/comments/pending`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return result.json();
  } catch (error) {
    console.error("Error getting comment:", error);
    return null;
  }
}

async function approveComment(PostId: number, CommentId: string) {
  try {
    const token = await getCookies();
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/post/comments/pending?postId=${PostId}&commentId=${CommentId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath("/console");
    return result.json();
  } catch (error) {
    console.error("Error getting comment:", error);
  }
}

async function getMonthlyPost(month: number, year: number) {
  try {
    const token = await getCookies();
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/post/monthly-stats?month=${month}&year=${year}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return result.json();
  } catch (error) {
    console.error("Error getting comment:", error);
    return null;
  }
}

async function likePost(slug: string) {
  try {
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/post/${slug}/like`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    revalidatePath("/");
    return result.json();
  } catch (error) {
    console.error("Error getting comment:", error);
  }
}

async function getNewsletterSubcriberPaginate({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  try {
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/newsletter-subscribe?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!result.ok) throw new Error("Failed to fetch subscribers");

    const data = await result.json();
    return data;
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return null;
  }
}

export {
  getCookies,
  login,
  registerUser,
  getAllPosts,
  getPostsByCategory,
  getPostBySlug,
  getCurrentUser,
  getPendingUser,
  activateUser,
  deleteUser,
  logoutUser,
  getAllCategories,
  getCategorybyId,
  addPost,
  deletePost,
  addCategory,
  deleteCategory,
  addComment,
  getPendingComments,
  approveComment,
  getMonthlyPost,
  likePost,
  getNewsletterSubcriberPaginate,
  getComments,
  updateCommentStatus,
  updateCommentMessage,
  deleteCommentById,
  updatePostPublishStatus,
  getAllPostComments,
};
