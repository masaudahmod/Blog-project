"use server";

import { cookies } from "next/headers";
import { getCurrentUser } from "./action";

export async function getCookies() {
  const myCookies = await cookies();
  const token = myCookies.get("token");
  return token ? token.value : null;
}

export async function getUser() {
    const token = await getCookies();
    if (!token) {
        return null;
    }
    try {
        const user  = await getCurrentUser();
        return user;
    }catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
}