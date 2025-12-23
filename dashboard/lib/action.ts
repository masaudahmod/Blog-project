"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { json } from "zod";

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

async function getAllPosts(page = 1) {
  try {
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/post?page=${page}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const { posts } = await result.json();
    if (result.ok) {
      return posts;
    } else {
      console.error("Error fetching posts");
      return [];
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
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

export {
  getCookies,
  login,
  getAllPosts,
  getCurrentUser,
  logoutUser,
  getAllCategories,
  getCategorybyId,
  addPost,
  addCategory,
  deleteCategory
};
