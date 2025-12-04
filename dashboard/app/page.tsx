import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const myCookie = await cookies();
  const token = myCookie.get("token");

  if (!token) {
    return redirect("/login");
  }
  return redirect("/console");
}
