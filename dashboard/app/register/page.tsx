import { RegisterForm } from "@/components/register-form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const myCookies = await cookies();
  const token = myCookies.get("token")?.value;
  if (token) {
    redirect("/console");
  }
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
