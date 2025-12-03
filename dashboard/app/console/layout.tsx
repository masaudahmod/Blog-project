import React from "react";
import DashboardLayout from "../(components)/DashboardLayout";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const myCookies = await cookies();
  const token = myCookies.get("token")?.value;
  if (!token) {
    redirect("/login");
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}
