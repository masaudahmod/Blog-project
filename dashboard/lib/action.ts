"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
  const email = formdata.get("email");
  const password = formdata.get("password");
  const result = await fetch(`${process.env.NEXT_SERVER_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      credentials: "include",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await result.json();
  if (data.token) {
    const cookieStore = await cookies();
    cookieStore.set("token", data.token, {
      httpOnly: true,
      path: "/",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    console.log("Token cookie set successfully");
    redirect("/console");
  }
  if (result.ok) {
    console.log(data.message);
  } else {
    console.log(data.message);
  }
}

export { getCookies, login };
